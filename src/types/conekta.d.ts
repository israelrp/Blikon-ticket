export interface ConektaTokenRequest {
  card: {
    number: string
    name: string
    exp_month: string
    exp_year: string
    cvc: string
  }
}

export interface ConektaTokenResponse {
  id: string
}

declare global {
  interface Window {
    Conekta?: {
      setPublicKey: (key: string) => void
      Token: {
        create: (
          data: ConektaTokenRequest,
          success: (token: ConektaTokenResponse) => void,
          error: (error: unknown) => void
        ) => void
      }
    }
  }
}

export {}
