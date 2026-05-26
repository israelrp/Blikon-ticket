import { useEffect, useState, useCallback } from 'react'
import type { ConektaTokenRequest, ConektaTokenResponse } from '../types/conekta'

const CONEKTA_SCRIPT_URL = 'https://cdn.conekta.io/js/latest/conekta.js'

export function useConekta(publicKey: string | undefined) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!publicKey) {
      setIsLoaded(false)
      return
    }

    if (window.Conekta) {
      window.Conekta.setPublicKey(publicKey)
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = CONEKTA_SCRIPT_URL
    script.async = true
    script.onload = () => {
      window.Conekta?.setPublicKey(publicKey)
      setIsLoaded(true)
    }
    script.onerror = () => {
      console.error('[useConekta] Error al cargar Conekta SDK')
      setIsLoaded(false)
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [publicKey])

  const tokenizeCard = useCallback(
    (cardData: ConektaTokenRequest): Promise<ConektaTokenResponse> => {
      return new Promise((resolve, reject) => {
        if (!isLoaded || !window.Conekta) {
          reject(new Error('Conekta no está cargado'))
          return
        }

        window.Conekta.Token.create(
          cardData,
          (token) => resolve(token),
          (error) => reject(error)
        )
      })
    },
    [isLoaded]
  )

  return { isLoaded, tokenizeCard }
}
