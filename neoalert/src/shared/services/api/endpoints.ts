export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    google: '/auth/google',
    forgotPassword: '/auth/forgot-password',
    verifyEmail: '/auth/verify-email',
    resetPassword: '/auth/reset-password',
    mfa: '/auth/mfa/verify',
    tenants: '/auth/tenants',
  },
  dashboard: {
    summary: '/dashboard',
    kpis: '/dashboard/kpis',
    alerts: '/dashboard/alerts',
  },
  attendance: {
    list: '/attendance',
    detail: (userId: string) => `/attendance/${userId}`,
    mark: '/attendance/mark',
  },
  maps: {
    incidents: '/maps/incidents',
    heatmap: '/maps/heatmap',
  },
  incidents: {
    list: '/incidents',
    detail: (id: string) => `/incidents/${id}`,
    create: '/incidents',
  },
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
  },
  imports: {
    list: '/imports',
    upload: '/imports/upload',
    detail: (id: string) => `/imports/${id}`,
    errors: (id: string) => `/imports/${id}/errors`,
  },
  importTemplates: {
    list: '/import-templates',
    detail: (id: string) => `/import-templates/${id}`,
    versions: (id: string) => `/import-templates/${id}/versions`,
  },
  reports: {
    list: '/reports',
    detail: (type: string) => `/reports/${type}`,
    export: (type: string) => `/reports/${type}/export`,
  },
  audit: {
    list: '/audit',
    detail: (id: string) => `/audit/${id}`,
  },
  operations: {
    plants: '/operations/plants',
    workSites: '/operations/sites',
    routes: '/operations/routes',
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    roles: (id: string) => `/users/${id}/roles`,
    permissions: (id: string) => `/users/${id}/permissions`,
  },
  roles: {
    list: '/roles',
    detail: (id: string) => `/roles/${id}`,
    permissions: (id: string) => `/roles/${id}/permissions`,
  },
  permissions: {
    list: '/permissions',
    accessRoutes: '/permissions/access-routes',
  },
} as const
