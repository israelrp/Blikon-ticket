import axios from 'axios'
import Cookies from 'js-cookie'

const ENV_MODE = import.meta.env.VITE_ENVIROMENT
const BASE_PATH = import.meta.env.VITE_BLIKON_API_URL
const JWT = import.meta.env.VITE_BLIKON_API_JWT

function getCookieFromDocument(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

async function validateAccessTokenLocal<T>(): Promise<T | null> {
  const usersEndpoint = `${BASE_PATH}/api/v3/users/validate_token`
  const accessToken = Cookies.get('access_token')

  if (!accessToken) {
    console.warn('[validateAccessToken] Local: no se encontró access_token en cookies (JS).')
    return null
  }

  try {
    const response = await axios.get<T>(usersEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    console.log('[validateAccessToken] ✓ Local exitoso')
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[validateAccessToken] ✗ Local falló:', message)
    return null
  }
}

async function validateAccessTokenDocument<T>(): Promise<T | null> {
  const usersEndpoint = `${BASE_PATH}/api/v3/users/validate_token`
  const accessToken = getCookieFromDocument('access_token')

  if (!accessToken) {
    console.log('[validateAccessToken] Deploy/doc: no se encontró access_token en document.cookie')
    return null
  }

  try {
    const response = await axios.get<T>(usersEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    console.log('[validateAccessToken] ✓ Deploy/doc exitoso')
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[validateAccessToken] ✗ Deploy/doc falló:', message)
    return null
  }
}

async function validateAccessTokenHttpOnly<T>(): Promise<T | null> {
  const cookiesEndpoint = `${BASE_PATH}/api/v3/cookies/validate_access_token`

  try {
    const response = await axios.get<T>(cookiesEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
    })
    console.log('[validateAccessToken] ✓ Deploy/httpOnly exitoso')
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[validateAccessToken] ✗ Deploy/httpOnly falló:', message)
    return null
  }
}

export async function validateAccessToken<T>(): Promise<T | null> {
  console.group('--- validateAccessToken ---')

  let result: T | null = null

  if (ENV_MODE === 'local') {
    result = await validateAccessTokenLocal<T>()
  } else {
    result = await validateAccessTokenDocument<T>()
    if (!result) {
      result = await validateAccessTokenHttpOnly<T>()
    }
  }

  console.groupEnd()
  return result
}
