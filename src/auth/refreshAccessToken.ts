import axios from 'axios'
import Cookies from 'js-cookie'

const ENV_MODE = import.meta.env.VITE_ENVIROMENT
const BASE_PATH = import.meta.env.VITE_BLIKON_API_URL
const JWT = import.meta.env.VITE_BLIKON_API_JWT

type CookieConfiguration = {
  access_cookie?: {
    name: string
    value: string
    expiration_timestamp: number
    secure: boolean
    same_site: 'strict' | 'lax' | 'none'
    path: string
  }
}

function getCookieFromDocument(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function applyAccessCookieLocally(cookieConfig: CookieConfiguration | undefined) {
  if (!cookieConfig?.access_cookie) return
  const { access_cookie } = cookieConfig
  Cookies.set(access_cookie.name, access_cookie.value, {
    expires: new Date(access_cookie.expiration_timestamp * 1000),
    secure: access_cookie.secure,
    sameSite: access_cookie.same_site,
    path: access_cookie.path,
  })
}

async function refreshAccessTokenLocal(): Promise<unknown | null> {
  const usersEndpoint = `${BASE_PATH}/api/v3/users/refresh_access_token`
  const refreshToken = Cookies.get('refresh_token')

  if (!refreshToken) {
    console.warn('[refreshAccessToken] Local: no se encontró refresh_token en cookies (JS).')
    return null
  }

  try {
    const response = await axios.get(usersEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    console.log('[refreshAccessToken] ✓ Local exitoso')
    applyAccessCookieLocally(response.data?.cookie_configuration)
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[refreshAccessToken] ✗ Local falló:', message)
    return null
  }
}

async function refreshAccessTokenDocument(): Promise<unknown | null> {
  const usersEndpoint = `${BASE_PATH}/api/v3/users/refresh_access_token`
  const refreshToken = getCookieFromDocument('refresh_token')

  if (!refreshToken) {
    console.log('[refreshAccessToken] Deploy/doc: no se encontró refresh_token en document.cookie')
    return null
  }

  try {
    const response = await axios.get(usersEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        refresh_token: refreshToken,
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    console.log('[refreshAccessToken] ✓ Deploy/doc exitoso')
    applyAccessCookieLocally(response.data?.cookie_configuration)
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[refreshAccessToken] ✗ Deploy/doc falló:', message)
    return null
  }
}

async function refreshAccessTokenHttpOnly(): Promise<unknown | null> {
  const cookiesEndpoint = `${BASE_PATH}/api/v3/cookies/refresh_access_token`

  try {
    const response = await axios.get(cookiesEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
    })

    console.log('[refreshAccessToken] ✓ Deploy/httpOnly exitoso')
    applyAccessCookieLocally(response.data?.cookie_configuration)
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[refreshAccessToken] ✗ Deploy/httpOnly falló:', message)
    return null
  }
}

export async function refreshAccessToken(): Promise<unknown | null> {
  console.group('--- refreshAccessToken ---')

  let result: unknown | null = null

  if (ENV_MODE === 'local') {
    result = await refreshAccessTokenLocal()
  } else {
    result = await refreshAccessTokenDocument()
    if (!result) {
      result = await refreshAccessTokenHttpOnly()
    }
  }

  console.groupEnd()
  return result
}
