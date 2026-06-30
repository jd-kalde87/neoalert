import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import type { AccessRoute, Permission } from '../types/admin.types'

export async function fetchPermissions(): Promise<Permission[]> {
  return authorizedRequest<Permission[]>(API_ENDPOINTS.permissions.list)
}

export async function fetchAccessRoutes(): Promise<AccessRoute[]> {
  return authorizedRequest<AccessRoute[]>(API_ENDPOINTS.permissions.accessRoutes)
}
