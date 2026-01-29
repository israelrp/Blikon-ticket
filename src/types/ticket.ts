export type GenericTicketSectionItem = {
  nombre?: string
  valor?: string
}

export type GenericTicketSection = {
  color?: string
  items?: Record<string, GenericTicketSectionItem>
  titulo?: string
}

export type GenericTicketMetadata = {
  folio?: string
  horapagado?: string
  icono?: string
  moneda?: string
  nombreplace?: string
  portada?: string
  ticketid?: number
  tipoticket?: number
  total?: string | number
  url?: string
}

export type GenericTicketDetailsData = {
  cadenaestatus?: string
  fecha?: string
  fechafull?: number
  folio?: string
  hora?: string
  metadata?: GenericTicketMetadata
  pago?: boolean
  secciones?: Record<string, GenericTicketSection>
  spaceid?: number
  status?: number
  estatus?: number
  tipoticket?: number
}
