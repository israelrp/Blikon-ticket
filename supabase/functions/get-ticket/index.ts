import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FirebaseTicket {
  cadenaestatus?: string
  fecha?: string
  fechafull?: number
  folio?: string
  hora?: string
  metadata?: {
    folio?: string
    horapagado?: string
    icono?: string
    moneda?: string
    nombreplace?: string
    portada?: string
    ticketid?: number
    tipoticket?: number
    total?: string
    url?: string
  }
  pago?: boolean
  secciones?: Record<string, {
    color?: string
    titulo?: string
    items?: Record<string, { nombre?: string; valor?: string }>
  }>
  spaceid?: number
  tipoticket?: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const ticketId = url.searchParams.get('ticketId')
    const folio = url.searchParams.get('folio')

    // Validate required parameters
    if (!ticketId || !folio) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: ticketId and folio',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Firebase config from secrets
    const firebaseDatabaseUrl = Deno.env.get('VITE_FIREBASE_DATABASE_URL')
    
    if (!firebaseDatabaseUrl) {
      console.error('VITE_FIREBASE_DATABASE_URL not configured')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch ticket from Firebase RTDB
    const firebaseUrl = `${firebaseDatabaseUrl}/tickets/${ticketId}.json`
    const firebaseResponse = await fetch(firebaseUrl)

    if (!firebaseResponse.ok) {
      console.error('Firebase fetch error:', firebaseResponse.status)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error fetching ticket from database',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const ticketData: FirebaseTicket | null = await firebaseResponse.json()

    // Check if ticket exists
    if (!ticketData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ticket no encontrado',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate folio matches
    const actualFolio = ticketData.folio || ticketData.metadata?.folio
    if (actualFolio !== folio) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Folio inválido para este ticket',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Success - return ticket data
    return new Response(
      JSON.stringify({
        success: true,
        ticket: ticketData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
