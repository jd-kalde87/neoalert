export interface AdminUser {
  id: string
  tenant_id: string
  email: string
  username: string | null
  full_name: string
  email_verified: boolean
  is_active: boolean
  is_superadmin: boolean
  roles: string[]
  created_at: string
}

export interface Role {
  id: string
  tenant_id: string
  code: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
}

export interface Permission {
  id: string
  code: string
  name: string
  resource: string
  action: string
  description: string | null
  created_at: string
}

export interface AccessRoute {
  route: string
  label: string
  group: string
  permission_code: string
  write_permission_code: string | null
}

export interface CreateUserPayload {
  email: string
  password: string
  full_name: string
  username?: string
  email_verified?: boolean
  is_active?: boolean
  role_ids?: string[]
}

export interface UpdateUserPayload {
  email?: string
  password?: string
  full_name?: string
  username?: string
  email_verified?: boolean
  is_active?: boolean
  role_ids?: string[]
}

export interface CreateRolePayload {
  code: string
  name: string
  description?: string
}

export interface UpdateRolePayload {
  name?: string
  description?: string
}
