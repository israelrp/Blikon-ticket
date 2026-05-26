/**
 * Direct Interweb API client (browser → api-interweb).
 *
 * MIGRATION NOTE (Netlify Functions):
 * - Move these calls behind serverless proxies: `get-payment-methods`, `add-payment-method`,
 *   `execute-payment`, `update-ticket-status`.
 * - Keep BLIKON_INTERWEB_API_JWT server-side only; validate Blikon session + re-read ticket
 *   amounts before calling RealizarPago.
 * - See docs/PAYMENTS.md for the target architecture.
 */

import type {
  ActualizarEstatusTicketPayload,
  NewPaymentMethodPayload,
  PaymentActionResponse,
  PaymentMethodsResponse,
  RealizarPagoPayload,
} from '../types/payment'

const INTERWEB_BASE_URL = import.meta.env.VITE_BLIKON_INTERWEB_API_URL
const INTERWEB_JWT = import.meta.env.VITE_BLIKON_INTERWEB_API_JWT

const ROUTES = {
  RECUPERAR_METODOS_PAGOS: '/api/MetodosPagos/RecuperarMetodosPagos',
  AGREGAR_METODO_PAGO: '/api/MetodosPagos/AgregarMetodoPago',
  REALIZAR_PAGO: '/api/Pagos/RealizarPago',
  ACTUALIZAR_ESTATUS_TICKET: '/api/Tickets/ActualizarEstatusTicket',
} as const

function assertInterwebConfig(): void {
  if (!INTERWEB_BASE_URL || !INTERWEB_JWT) {
    throw new Error('VITE_BLIKON_INTERWEB_API_URL o VITE_BLIKON_INTERWEB_API_JWT no configurados')
  }
}

async function interwebRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  assertInterwebConfig()

  const response = await fetch(`${INTERWEB_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${INTERWEB_JWT}`,
      ...(options.headers ?? {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (data as { mensaje?: string } | null)?.mensaje ??
      `Error HTTP ${response.status}`
    throw new Error(message)
  }

  return data as T
}

export async function fetchPaymentMethods(
  usuarioId: number
): Promise<PaymentMethodsResponse> {
  const params = new URLSearchParams({ Usuarioid: String(usuarioId) })
  return interwebRequest<PaymentMethodsResponse>(
    `${ROUTES.RECUPERAR_METODOS_PAGOS}/?${params.toString()}`
  )
}

export async function addPaymentMethod(
  payload: NewPaymentMethodPayload
): Promise<PaymentActionResponse> {
  return interwebRequest<PaymentActionResponse>(ROUTES.AGREGAR_METODO_PAGO, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function realizarPago(
  payload: RealizarPagoPayload
): Promise<PaymentActionResponse> {
  return interwebRequest<PaymentActionResponse>(ROUTES.REALIZAR_PAGO, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function actualizarEstatusTicket(
  payload: ActualizarEstatusTicketPayload
): Promise<PaymentActionResponse> {
  return interwebRequest<PaymentActionResponse>(ROUTES.ACTUALIZAR_ESTATUS_TICKET, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
