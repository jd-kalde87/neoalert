import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  tenantId: string | null
  isAuthenticated: boolean
  setSession: (payload: {
    user: AuthUser
    accessToken: string
    refreshToken?: string | null
    tenantId?: string | null
  }) => void
  setUserProfile: (user: AuthUser) => void
  setTenant: (tenantId: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      isAuthenticated: false,
      setSession: ({ user, accessToken, refreshToken = null, tenantId = null }) =>
        set({ user, accessToken, refreshToken, tenantId, isAuthenticated: true }),
      setUserProfile: (user) =>
        set((state) => (state.isAuthenticated ? { user } : {})),
      setTenant: (tenantId) => set({ tenantId }),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          tenantId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'neoalert-auth',
      version: 3,
      migrate: (persisted, version) => {
        if (version < 2) {
          return {
            user: null,
            accessToken: null,
            refreshToken: null,
            tenantId: null,
            isAuthenticated: false,
          }
        }

        const state = persisted as AuthState
        if (state.user && !Array.isArray(state.user.permissions)) {
          return {
            ...state,
            user: {
              ...state.user,
              permissions: [],
            },
          }
        }

        return state
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
