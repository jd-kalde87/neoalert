import { apiClient } from './client'
import { DEFAULT_TENANT_ID } from './utils'

let accessToken: string | null = null
let tenantId: string | null = DEFAULT_TENANT_ID
let refreshHandler: (() => Promise<string | null>) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setTenantIdHeader(id: string | null) {
  tenantId = id ?? DEFAULT_TENANT_ID
}

export function setRefreshHandler(handler: (() => Promise<string | null>) | null) {
  refreshHandler = handler
}

export async function authorizedRequest<T>(
  path: string,
  config: Parameters<typeof apiClient>[1] = {},
): Promise<T> {
  const headers = new Headers(config.headers)

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  if (tenantId) {
    headers.set('X-Tenant-ID', tenantId)
  }

  try {
    return await apiClient<T>(path, { ...config, headers })
  } catch (error) {
    if (
      error instanceof Error &&
      'status' in error &&
      (error as { status?: number }).status === 401 &&
      refreshHandler
    ) {
      const newToken = await refreshHandler()
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient<T>(path, { ...config, headers })
      }
    }

    throw error
  }
}
