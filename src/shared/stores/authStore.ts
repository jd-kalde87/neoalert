import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  roles: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  tenantId: string | null
  isAuthenticated: boolean
  setSession: (payload: {
    user: AuthUser
    accessToken: string
    tenantId?: string | null
  }) => void
  setTenant: (tenantId: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      tenantId: null,
      isAuthenticated: false,
      setSession: ({ user, accessToken, tenantId = null }) =>
        set({ user, accessToken, tenantId, isAuthenticated: true }),
      setTenant: (tenantId) => set({ tenantId }),
      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          tenantId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'neoalert-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
