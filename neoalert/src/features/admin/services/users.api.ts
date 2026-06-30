import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import type {
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/admin.types'

export async function fetchUsers(search?: string): Promise<AdminUser[]> {
  return authorizedRequest<AdminUser[]>(API_ENDPOINTS.users.list, {
    params: search ? { search } : undefined,
  })
}

export async function fetchUser(userId: string): Promise<AdminUser> {
  return authorizedRequest<AdminUser>(API_ENDPOINTS.users.detail(userId))
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  return authorizedRequest<AdminUser>(API_ENDPOINTS.users.list, {
    method: 'POST',
    body: payload,
  })
}

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<AdminUser> {
  return authorizedRequest<AdminUser>(API_ENDPOINTS.users.detail(userId), {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteUser(userId: string): Promise<void> {
  await authorizedRequest(API_ENDPOINTS.users.detail(userId), {
    method: 'DELETE',
  })
}

export async function fetchUserPermissions(userId: string): Promise<string[]> {
  const response = await authorizedRequest<{ user_id: string; permissions: string[] }>(
    API_ENDPOINTS.users.permissions(userId),
  )
  return response.permissions
}
