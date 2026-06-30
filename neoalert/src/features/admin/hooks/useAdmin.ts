import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser,
  deleteUser,
  fetchUser,
  fetchUserPermissions,
  fetchUsers,
  updateUser,
} from '../services/users.api'
import {
  createRole,
  deleteRole,
  fetchRolePermissions,
  fetchRoles,
  replaceRolePermissions,
  updateRole,
} from '../services/roles.api'
import { fetchAccessRoutes, fetchPermissions } from '../services/permissions.api'
import type { CreateRolePayload, CreateUserPayload, UpdateRolePayload, UpdateUserPayload } from '../types/admin.types'

export function useUsers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'users', search ?? ''],
    queryFn: () => fetchUsers(search),
  })
}

export function useUser(userId?: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  })
}

export function useUserPermissions(userId?: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'permissions'],
    queryFn: () => fetchUserPermissions(userId!),
    enabled: Boolean(userId),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: fetchRoles,
  })
}

export function useRolePermissions(roleId?: string) {
  return useQuery({
    queryKey: ['admin', 'roles', roleId, 'permissions'],
    queryFn: () => fetchRolePermissions(roleId!),
    enabled: Boolean(roleId),
  })
}

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: fetchPermissions,
  })
}

export function useAccessRoutes() {
  return useQuery({
    queryKey: ['admin', 'access-routes'],
    queryFn: fetchAccessRoutes,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] }),
  })
}

export function useUpdateRole(roleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => updateRole(roleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] }),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] }),
  })
}

export function useReplaceRolePermissions(roleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (permissionIds: string[]) => replaceRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles', roleId, 'permissions'] })
    },
  })
}
