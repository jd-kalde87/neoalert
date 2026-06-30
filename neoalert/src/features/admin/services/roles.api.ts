import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import type {
  CreateRolePayload,
  Permission,
  Role,
  UpdateRolePayload,
} from '../types/admin.types'

export async function fetchRoles(): Promise<Role[]> {
  return authorizedRequest<Role[]>(API_ENDPOINTS.roles.list)
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  return authorizedRequest<Role>(API_ENDPOINTS.roles.list, {
    method: 'POST',
    body: payload,
  })
}

export async function updateRole(roleId: string, payload: UpdateRolePayload): Promise<Role> {
  return authorizedRequest<Role>(API_ENDPOINTS.roles.detail(roleId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteRole(roleId: string): Promise<void> {
  await authorizedRequest(API_ENDPOINTS.roles.detail(roleId), {
    method: 'DELETE',
  })
}

export async function fetchRolePermissions(roleId: string): Promise<Permission[]> {
  const response = await authorizedRequest<{ role_id: string; permissions: Permission[] }>(
    API_ENDPOINTS.roles.permissions(roleId),
  )
  return response.permissions
}

export async function replaceRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
  await authorizedRequest(API_ENDPOINTS.roles.permissions(roleId), {
    method: 'PUT',
    body: { permission_ids: permissionIds },
  })
}
