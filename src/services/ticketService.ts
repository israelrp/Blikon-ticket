import type { GenericTicketDetailsData } from '../types/ticket'

/**
 * Supported URL structures:
 * - Netlify (production): blikon-ticket.netlify.app/ticket-{ticketId}-folio-{folio}
 *   Example: blikon-ticket.netlify.app/ticket-47-folio-7382
 * - Legacy hostname: {dominio}-ticket-{ticketId}-folio-{folio}.com.blog
 *   Example: cemex-ticket-39-folio-asdj6546532.com.blog
 * - Query params (local/dev): ?ticketId=47&folio=7382&dominio=blikon
 */
export interface TicketUrlParams {
  dominio: string | null
  ticketId: string | null
  folio: string | null
}

/**
 * Extracts ticket parameters from the URL.
 *
 * Priority:
 * 1) Query params (useful for local/dev)
 * 2) Netlify pathname formats
 * 3) Legacy hostname format
 */
export function extractTicketParamsFromUrl(): TicketUrlParams {
  // Allow query params for local testing: ?ticketId=39&folio=asdj6546532&dominio=cemex
  const urlParams = new URLSearchParams(window.location.search)
  const ticketIdParam = urlParams.get('ticketId')
  const folioParam = urlParams.get('folio')

  if (ticketIdParam && folioParam) {
    return {
      ticketId: ticketIdParam,
      folio: folioParam,
      dominio: urlParams.get('dominio') || 'test',
    }
  }

  const hostname = window.location.hostname
  const pathname = window.location.pathname

  // Netlify pathname formats:
  // - /ticket-47-folio-7382
  // - /ticket/47/folio/7382
  const netlifyPathMatch =
    pathname.match(/\/ticket-(\d+)-folio-([^/]+)\/?$/i) ||
    pathname.match(/\/ticket\/(\d+)\/folio\/([^/]+)\/?$/i)

  if (netlifyPathMatch) {
    const [, id, folioRaw] = netlifyPathMatch
    let decodedFolio = folioRaw
    try {
      decodedFolio = decodeURIComponent(folioRaw)
    } catch {
      // If it's already decoded or malformed, keep raw
    }

    return {
      dominio: urlParams.get('dominio') || 'blikon',
      ticketId: id,
      folio: decodedFolio,
    }
  }

  // Legacy hostname pattern: {dominio}-ticket-{ticketId}-folio-{folio}.com.blog
  const match = hostname.match(/^(.+?)-ticket-(\d+)-folio-(.+?)\.com\.blog$/i)

  if (match) {
    return {
      dominio: match[1],
      ticketId: match[2],
      folio: match[3],
    }
  }

  return { ticketId: null, folio: null, dominio: null }
}

export interface FetchTicketResult {
  success: boolean
  ticket: GenericTicketDetailsData | null
  error: string | null
}

/**
 * Fetches ticket via Supabase Edge Function.
 * The Edge Function handles Firebase RTDB access and folio validation.
 */
export async function fetchTicket(
  ticketId: string,
  folio: string
): Promise<FetchTicketResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('VITE_PUBLIC_SUPABASE_URL or VITE_PUBLIC_SUPABASE_ANON_KEY not configured')
      return {
        success: false,
        ticket: null,
        error: 'Error de configuración',
      }
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-ticket?ticketId=${encodeURIComponent(ticketId)}&folio=${encodeURIComponent(folio)}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
      }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {
      return {
        success: false,
        ticket: null,
        error: data.error || 'Error al cargar el ticket',
      }
    }

    return {
      success: true,
      ticket: data.ticket,
      error: null,
    }
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return {
      success: false,
      ticket: null,
      error: error instanceof Error ? error.message : 'Error al cargar el ticket',
    }
  }
}

/**
 * Generates a ticket URL from the given parameters.
 * Used for creating shareable links.
 */
export function generateTicketUrl(
  _dominio: string,
  ticketId: number | string,
  folio: string
): string {
  // Primary share URL (Netlify)
  return `https://blikon-ticket.netlify.app/ticket-${ticketId}-folio-${encodeURIComponent(folio)}`
}
