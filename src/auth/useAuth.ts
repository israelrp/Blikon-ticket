import { useState, useEffect, useCallback } from 'react'
import { validateAccessToken } from './validateAccessToken'
import { refreshAccessToken } from './refreshAccessToken'
import { getUser, type BlikonUser } from './getUser'

const LOGIN_URL = import.meta.env.VITE_BLIKON_LOGIN_URL ?? 'http://localhost:3001'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type TokenValidationResult = {
  result?: boolean
  blikon_id?: string
}

interface UseAuthReturn {
  status: AuthStatus
  user: BlikonUser | null
  redirectToLogin: () => void
}

export function useAuth(): UseAuthReturn {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<BlikonUser | null>(null)

  const checkAuth = useCallback(async () => {
    console.group('=== useAuth: checkAuth ===')
    setStatus('loading')

    let tokenData = await validateAccessToken<TokenValidationResult>()

    if (!tokenData) {
      console.log('[useAuth] access_token inválido o ausente, intentando refresh...')
      tokenData = await refreshAccessToken() as TokenValidationResult | null
    }

    if (!tokenData || !tokenData.result) {
      console.warn('[useAuth] Sin sesión válida.')
      setStatus('unauthenticated')
      setUser(null)
      console.groupEnd()
      return
    }

    const blikonId = tokenData.blikon_id
    if (!blikonId) {
      console.warn('[useAuth] tokenData no contiene blikon_id.')
      setStatus('unauthenticated')
      setUser(null)
      console.groupEnd()
      return
    }

    const userData = await getUser(blikonId)
    if (userData?.result) {
      console.log('[useAuth] ✓ Usuario autenticado:', userData.profile_name)
      setUser(userData)
      setStatus('authenticated')
    } else {
      console.warn('[useAuth] No se pudo obtener datos del usuario.')
      setStatus('unauthenticated')
      setUser(null)
    }

    console.groupEnd()
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const redirectToLogin = useCallback(() => {
    const origin = encodeURIComponent(window.location.href)
    window.location.href = `${LOGIN_URL}?origin=${origin}`
  }, [])

  return { status, user, redirectToLogin }
}
