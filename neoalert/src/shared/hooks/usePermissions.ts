import { useMemo } from 'react'
import {
  canAccessNavItem,
  canAccessRoute,
  isAdminUser,
  resolveEffectivePermissions,
} from '@shared/constants/permissions'
import { useAuthStore } from '@shared/stores/authStore'

export function useAuthAccess() {
  const user = useAuthStore((state) => state.user)

  return useMemo(() => {
    const roles = user?.roles ?? []
    const permissions = user?.permissions ?? []
    const effectivePermissions = resolveEffectivePermissions(roles, permissions)

    return {
      user,
      roles,
      permissions,
      effectivePermissions,
      isAdmin: isAdminUser(roles),
      canAccessRoute: (pathname: string) => canAccessRoute(pathname, roles, permissions),
      canAccessNavItem: (routePath: string) => canAccessNavItem(routePath, roles, permissions),
      hasPermission: (permission: string) => effectivePermissions.has(permission),
    }
  }, [user])
}
