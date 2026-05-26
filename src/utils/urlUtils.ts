export function getLoginBaseUrl(): string {
  return import.meta.env.VITE_BLIKON_LOGIN_URL ?? 'http://localhost:3001'
}

export function buildTicketOriginUrl(ticketId: number | string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/db/tickets/${ticketId}`
}

export function buildLoginRedirectUrlForTicket(ticketId: number | string): string {
  const encodedOrigin = encodeURIComponent(buildTicketOriginUrl(ticketId))
  return `${getLoginBaseUrl()}/?origin=${encodedOrigin}`
}
