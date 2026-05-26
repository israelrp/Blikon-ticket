/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SUPABASE_URL: string
  readonly VITE_PUBLIC_SUPABASE_ANON_KEY: string
  readonly VITE_ENVIROMENT?: string
  readonly VITE_BLIKON_API_URL?: string
  readonly VITE_BLIKON_API_JWT?: string
  readonly VITE_BLIKON_LOGIN_URL?: string
  readonly VITE_BLIKON_INTERWEB_API_URL?: string
  readonly VITE_BLIKON_INTERWEB_API_JWT?: string
  readonly VITE_CONEKTA_PUBLIC_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
