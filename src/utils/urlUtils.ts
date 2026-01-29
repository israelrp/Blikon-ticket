export function getLoginBaseUrl(): string {
  return 'https://validacel.com.blog'
}

export function buildTicketOriginUrl(ticketId: number | string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/db/tickets/${ticketId}`
}

export function buildLoginRedirectUrlForTicket(ticketId: number | string): string {
  const encodedOrigin = encodeURIComponent(buildTicketOriginUrl(ticketId))
  return `${getLoginBaseUrl()}/?origin=${encodedOrigin}`
}
