import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { canAccessRoute } from '@shared/constants/permissions'
import { useAuthStore } from '@shared/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <>{children}</>
}

interface RoleGuardProps {
  children: React.ReactNode
}

export function RoleGuard({ children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  const allowed = canAccessRoute(
    location.pathname,
    user.roles,
    user.permissions ?? [],
  )

  if (!allowed) {
    return <Navigate to={ROUTES.unauthorized} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
