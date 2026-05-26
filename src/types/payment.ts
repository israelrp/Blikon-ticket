export interface PaymentMethod {
  id: number
  usuarioId: number
  numeroTarjeta: string
  nombreCompleto: string
  mes: string
  año: string
  emisor: string
  predeterminado: boolean
  idTarjetaCK: string
  email: string
  orden: number
  eliminado: boolean
}

export interface PaymentMethodsResponse {
  metodosPagos: PaymentMethod[]
  resultado: boolean
  mensaje: string | null
}

export interface PaymentActionResponse {
  resultado: boolean
  mensaje: string | null
}

export interface NewPaymentMethodPayload {
  blikonId: string
  numeroTarjeta: string
  tokenTarjeta: string
  nombreCompleto: string
  mes: string
  año: string
  emisor: string
  email: string
}

export interface RealizarPagoPayload {
  usuarioIdEmisor: number
  usuarioIdReceptor: number
  descripcion: string
  importe: number
  metodoPagoId: number
  urlOrigen: string
  emailEmisor: string
  spaceId: number
  referencia: string
  propina: number
  ticketId: number
}

export interface ActualizarEstatusTicketPayload {
  usuarioId: number
  usuarioPerfilId: number
  spaceId: number
  ticketId: number
  cadenaEstatus: string
}
