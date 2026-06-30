import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { GOOGLE_CLIENT_ID } from '@shared/config/api.config'
import { fetchCurrentUser } from '@features/auth/services/auth.api'
import { useOnlineStatus } from '@shared/hooks/useOnlineStatus'
import { bootstrapAuthInterceptors } from '@shared/services/api/bootstrap-auth'
import { useAuthStore } from '@shared/stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

function OnlineStatusListener() {
  useOnlineStatus()
  return null
}

function AuthProfileSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setUserProfile = useAuthStore((state) => state.setUserProfile)

  useEffect(() => {
    if (!isAuthenticated) return

    void fetchCurrentUser()
      .then((profile) => {
        setUserProfile({
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          roles: profile.roles,
          permissions: profile.permissions,
        })
      })
      .catch(() => undefined)
  }, [isAuthenticated, setUserProfile])

  return null
}

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    bootstrapAuthInterceptors()
  }, [])

  const content = (
    <QueryClientProvider client={queryClient}>
      <OnlineStatusListener />
      <AuthProfileSync />
      {children}
    </QueryClientProvider>
  )

  if (!GOOGLE_CLIENT_ID) {
    return content
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>
}
