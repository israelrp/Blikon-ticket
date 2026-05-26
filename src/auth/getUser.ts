import axios from 'axios'
import Cookies from 'js-cookie'

const ENV_MODE = import.meta.env.VITE_ENVIROMENT
const BASE_PATH = import.meta.env.VITE_BLIKON_API_URL
const JWT = import.meta.env.VITE_BLIKON_API_JWT

function getCookieFromDocument(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

async function getUserLocal<T>(blikonId: string): Promise<T | null> {
  const usersEndpoint = `${BASE_PATH}/api/v3/users/get_by_blikon_id`
  const accessToken = Cookies.get('access_token')

  if (!accessToken) {
    console.warn('[getUser] Local: no se encontró access_token en cookies (JS).')
    return null
  }

  try {
    const response = await axios.get<T>(usersEndpoint, {
      withCredentials: true,
      params: { blikon_id: blikonId },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
    })
    console.log('[getUser] ✓ Local exitoso')
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[getUser] ✗ Local falló:', message)
    return null
  }
}

async function getUserDocument<T>(blikonId: string): Promise<T | null> {
  const usersEndpoint = `${BASE_PATH}/api/v3/users/get_by_blikon_id`
  const accessToken = getCookieFromDocument('access_token')

  if (!accessToken) {
    console.log('[getUser] Deploy/doc: no se encontró access_token en document.cookie')
    return null
  }

  try {
    const response = await axios.get<T>(usersEndpoint, {
      withCredentials: true,
      params: { blikon_id: blikonId },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        access_token: accessToken,
        Authorization: `Bearer ${JWT}`,
      },
    })
    console.log('[getUser] ✓ Deploy/doc exitoso')
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[getUser] ✗ Deploy/doc falló:', message)
    return null
  }
}

async function getUserHttpOnly<T>(): Promise<T | null> {
  const cookiesEndpoint = `${BASE_PATH}/api/v3/cookies/get_user`

  try {
    const response = await axios.get<T>(cookiesEndpoint, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
    })
    console.log('[getUser] ✓ Deploy/httpOnly exitoso')
    return response.data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[getUser] ✗ Deploy/httpOnly falló:', message)
    return null
  }
}

export interface BlikonUser {
  result: boolean
  message: string
  user_id: number
  roles: string[]
  blikon_profile_id: number
  blikon_id: string
  user_type_id: number
  status_id: number
  registered_user: boolean
  phone_number: string
  email?: string | null
  email_is_confirmed?: boolean
  username?: string | null
  profile_name: string
  photo: string
  first_name?: string | null
  last_name?: string | null
  mother_last_name?: string | null
}

export async function getUser(blikonId: string): Promise<BlikonUser | null> {
  console.group(`--- getUser (blikonId: ${blikonId}) ---`)

  let result: BlikonUser | null = null

  if (ENV_MODE === 'local') {
    result = await getUserLocal<BlikonUser>(blikonId)
  } else {
    result = await getUserDocument<BlikonUser>(blikonId)
    if (!result) {
      result = await getUserHttpOnly<BlikonUser>()
    }
  }

  console.groupEnd()
  return result
}
