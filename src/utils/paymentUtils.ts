import type { GenericTicketDetailsData } from '../types/ticket'
import type { BlikonUser } from '../auth/getUser'
import type { PaymentMethod, RealizarPagoPayload } from '../types/payment'

export function parseAmount(value?: string | number | null): number {
  if (value === null || value === undefined) return 0
  const text = typeof value === 'string' ? value : String(value)
  const numeric = text.replace(/[^0-9.,-]/g, '').replace(/,/g, '')
  const parsed = Number.parseFloat(numeric)
  return Number.isFinite(parsed) ? parsed : 0
}

export function parsePropinaFromSections(ticketDetails: GenericTicketDetailsData): number {
  if (!ticketDetails.secciones) return 0

  for (const section of Object.values(ticketDetails.secciones)) {
    if (!section.items) continue
    for (const item of Object.values(section.items)) {
      const name = item.nombre?.toLowerCase() ?? ''
      if (name.includes('propina')) {
        return parseAmount(item.valor)
      }
    }
  }

  return 0
}

export function buildRealizarPagoPayload({
  authUser,
  ticketDetails,
  paymentMethod,
  importe,
  propina,
}: {
  authUser: BlikonUser
  ticketDetails: GenericTicketDetailsData
  paymentMethod: PaymentMethod
  importe: number
  propina: number
}): RealizarPagoPayload | null {
  const ticketId = ticketDetails.metadata?.ticketid ?? ticketDetails.spaceid
  const spaceId = ticketDetails.spaceid
  const ticketUrl = ticketDetails.metadata?.url ?? ''

  if (!ticketId || !spaceId) return null

  return {
    usuarioIdEmisor: authUser.user_id,
    usuarioIdReceptor: spaceId,
    descripcion: ticketUrl,
    importe,
    metodoPagoId: paymentMethod.id,
    urlOrigen: ticketUrl,
    emailEmisor: paymentMethod.email || authUser.email || '',
    spaceId,
    referencia: '',
    propina,
    ticketId,
  }
}

export function maskCardNumber(numeroTarjeta: string): string {
  const digits = numeroTarjeta.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  return `•••• ${digits.slice(-4)}`
}

export function getCardBrandLabel(emisor: string): string {
  const normalized = emisor.trim().toUpperCase()
  if (normalized.includes('VISA')) return 'Visa'
  if (normalized.includes('MASTER')) return 'Mastercard'
  if (normalized.includes('AMEX') || normalized.includes('AMERICAN')) return 'Amex'
  if (normalized.includes('PAY2PAY')) return 'Pay2Pay'
  return emisor || 'Tarjeta'
}

export function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (/^4/.test(cleaned)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(cleaned)) return 'MASTERCARD'
  if (/^3[47]/.test(cleaned)) return 'AMERICAN_EXPRESS'
  return 'VISA'
}
