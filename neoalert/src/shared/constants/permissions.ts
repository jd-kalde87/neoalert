import { ROUTES } from '@shared/constants/routes'

/** Permisos alineados con el modelo resource:action del identity-service. */
export const PERMISSIONS = {
  dashboardRead: 'dashboard:read',
  mapsRead: 'maps:read',
  operationsRead: 'operations:read',
  operationsWrite: 'operations:write',
  incidentsRead: 'incidents:read',
  incidentsWrite: 'incidents:write',
  attendanceRead: 'attendance:read',
  notificationsRead: 'notifications:read',
  importsRead: 'imports:read',
  importsWrite: 'imports:write',
  templatesRead: 'import-templates:read',
  templatesWrite: 'import-templates:write',
  reportsRead: 'reports:read',
  auditRead: 'audit:read',
  usersRead: 'users:read',
  usersWrite: 'users:write',
  rolesRead: 'roles:read',
  rolesManage: 'roles:manage',
  permissionsRead: 'permissions:read',
  permissionsManage: 'permissions:manage',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface RouteAccessRule {
  /** Permisos efectivos requeridos (cualquiera de la lista). */
  permissions: PermissionCode[]
  /** Roles permitidos si aún no tienen permisos de dominio asignados. */
  roles: string[]
}

/** Permisos por defecto cuando el usuario tiene un rol pero el backend aún no asignó permisos de dominio. */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionCode[]> = {
  admin: Object.values(PERMISSIONS),
  supervisor: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.mapsRead,
    PERMISSIONS.operationsRead,
    PERMISSIONS.operationsWrite,
    PERMISSIONS.incidentsRead,
    PERMISSIONS.incidentsWrite,
    PERMISSIONS.attendanceRead,
    PERMISSIONS.notificationsRead,
    PERMISSIONS.importsRead,
    PERMISSIONS.importsWrite,
    PERMISSIONS.templatesRead,
    PERMISSIONS.templatesWrite,
    PERMISSIONS.reportsRead,
  ],
  viewer: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.mapsRead,
    PERMISSIONS.notificationsRead,
    PERMISSIONS.reportsRead,
  ],
  analyst: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.mapsRead,
    PERMISSIONS.incidentsRead,
    PERMISSIONS.reportsRead,
    PERMISSIONS.auditRead,
    PERMISSIONS.notificationsRead,
  ],
  operator: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.attendanceRead,
    PERMISSIONS.notificationsRead,
  ],
  colaborador: [
    PERMISSIONS.dashboardRead,
    PERMISSIONS.attendanceRead,
    PERMISSIONS.notificationsRead,
  ],
}

type RoutePattern = {
  pattern: RegExp
  rule: RouteAccessRule
}

function routePattern(route: string): string {
  return route.replace(/:[^/]+/g, '[^/]+')
}

const ROUTE_ACCESS_RULES: RoutePattern[] = [
  {
    pattern: new RegExp(`^${routePattern(ROUTES.operationsPlantNew)}$|^${routePattern(ROUTES.operationsPlantEdit)}$|^${routePattern(ROUTES.operationsSiteNew)}$|^${routePattern(ROUTES.operationsSiteEdit)}$|^${routePattern(ROUTES.operationsRouteNew)}$|^${routePattern(ROUTES.operationsRouteEdit)}$`),
    rule: {
      permissions: [PERMISSIONS.operationsWrite],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${routePattern(ROUTES.incidentNew)}$`),
    rule: {
      permissions: [PERMISSIONS.incidentsWrite],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${routePattern(ROUTES.importUpload)}$`),
    rule: {
      permissions: [PERMISSIONS.importsWrite],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${routePattern(ROUTES.importTemplateNew)}$`),
    rule: {
      permissions: [PERMISSIONS.templatesWrite],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.dashboard}$`),
    rule: {
      permissions: [PERMISSIONS.dashboardRead],
      roles: ['admin', 'supervisor', 'viewer', 'analyst', 'operator', 'colaborador'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.maps}$|^${ROUTES.heatmap}$`),
    rule: {
      permissions: [PERMISSIONS.mapsRead],
      roles: ['admin', 'supervisor', 'viewer', 'analyst'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.operations}(/|$)`),
    rule: {
      permissions: [PERMISSIONS.operationsRead],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.incidents}$|^${routePattern(ROUTES.incidentDetail)}$`),
    rule: {
      permissions: [PERMISSIONS.incidentsRead],
      roles: ['admin', 'supervisor', 'analyst'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.attendance}(/|$)`),
    rule: {
      permissions: [PERMISSIONS.attendanceRead],
      roles: ['admin', 'supervisor', 'operator', 'colaborador'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.notifications}$`),
    rule: {
      permissions: [PERMISSIONS.notificationsRead],
      roles: ['admin', 'supervisor', 'viewer', 'analyst', 'operator', 'colaborador'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.imports}$|^${routePattern(ROUTES.importDetail)}$`),
    rule: {
      permissions: [PERMISSIONS.importsRead],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.importTemplates}$|^${routePattern(ROUTES.importTemplateDetail)}$`),
    rule: {
      permissions: [PERMISSIONS.templatesRead],
      roles: ['admin', 'supervisor'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.reports}$|^${routePattern(ROUTES.reportDetail)}$`),
    rule: {
      permissions: [PERMISSIONS.reportsRead],
      roles: ['admin', 'supervisor', 'viewer', 'analyst'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.audit}$|^${routePattern(ROUTES.auditDetail)}$`),
    rule: {
      permissions: [PERMISSIONS.auditRead],
      roles: ['admin', 'analyst'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.users}$|^${routePattern(ROUTES.userEdit)}$`),
    rule: {
      permissions: [PERMISSIONS.usersRead],
      roles: ['admin'],
    },
  },
  {
    pattern: new RegExp(`^${routePattern(ROUTES.userNew)}$`),
    rule: {
      permissions: [PERMISSIONS.usersWrite],
      roles: ['admin'],
    },
  },
  {
    pattern: new RegExp(`^${ROUTES.roles}$`),
    rule: {
      permissions: [PERMISSIONS.rolesRead],
      roles: ['admin'],
    },
  },
]

export function normalizeRoutePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function getRouteAccessRule(pathname: string): RouteAccessRule | null {
  const normalized = normalizeRoutePath(pathname)
  return ROUTE_ACCESS_RULES.find(({ pattern }) => pattern.test(normalized))?.rule ?? null
}

export function resolveEffectivePermissions(
  roles: string[],
  permissions: string[],
): Set<string> {
  const effective = new Set<string>(permissions)

  for (const role of roles) {
    if (role === 'admin') {
      Object.values(PERMISSIONS).forEach((permission) => effective.add(permission))
      continue
    }

    const defaults = ROLE_DEFAULT_PERMISSIONS[role]
    defaults?.forEach((permission) => effective.add(permission))
  }

  return effective
}

export function isAdminUser(roles: string[]): boolean {
  return roles.includes('admin')
}

export function canAccessRoute(
  pathname: string,
  roles: string[],
  permissions: string[],
): boolean {
  if (isAdminUser(roles)) return true

  const normalized = normalizeRoutePath(pathname)
  const rule = getRouteAccessRule(normalized)

  if (!rule) return true

  const hasNoAccessProfile = roles.length === 0 && permissions.length === 0
  if (hasNoAccessProfile && normalized === ROUTES.dashboard) {
    return true
  }

  const effective = resolveEffectivePermissions(roles, permissions)

  if (rule.permissions.some((permission) => effective.has(permission))) {
    return true
  }

  return rule.roles.some((role) => roles.includes(role))
}

export function canAccessNavItem(
  routePath: string,
  roles: string[],
  permissions: string[],
): boolean {
  return canAccessRoute(routePath, roles, permissions)
}
