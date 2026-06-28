import { apiClient } from './client'

let accessToken: string | null = null
let refreshHandler: (() => Promise<string | null>) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
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
