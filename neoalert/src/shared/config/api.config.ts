export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

/** Mock API desactivado por defecto; solo activar explícitamente con VITE_USE_MOCK_API=true. */

export const DEFAULT_TENANT_ID =
  import.meta.env.VITE_DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000001'

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
