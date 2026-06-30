import { setAccessToken, setRefreshHandler, setTenantIdHeader } from '@shared/services/api/interceptors'
import { DEFAULT_TENANT_ID } from '@shared/config/api.config'
import { refreshAccessToken } from '@features/auth/services/auth.api'
import { useAuthStore } from '@shared/stores/authStore'

export function bootstrapAuthInterceptors() {
  const syncFromStore = () => {
    const state = useAuthStore.getState()
    setAccessToken(state.accessToken)
    setTenantIdHeader(state.tenantId ?? DEFAULT_TENANT_ID)
  }

  syncFromStore()

  useAuthStore.subscribe((state, previous) => {
    if (state.accessToken !== previous.accessToken) {
      setAccessToken(state.accessToken)
    }
    if (state.tenantId !== previous.tenantId) {
      setTenantIdHeader(state.tenantId ?? DEFAULT_TENANT_ID)
    }
  })

  setRefreshHandler(async () => {
    const { refreshToken, setSession, user, tenantId, clearSession } = useAuthStore.getState()
    if (!refreshToken || !user) {
      clearSession()
      return null
    }

    try {
      const tokens = await refreshAccessToken(refreshToken)
      setSession({
        user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tenantId,
      })
      return tokens.access_token
    } catch {
      clearSession()
      return null
    }
  })
}
