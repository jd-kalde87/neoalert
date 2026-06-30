import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { apiClient, authorizedRequest } from '@shared/services/api'
import { DEFAULT_TENANT_ID } from '@shared/config/api.config'
import type { AuthUser } from '@shared/stores/authStore'

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  username?: string
}

export interface RegisterResponse {
  id: string
  email: string
  full_name: string
  message: string
  verification_email_sent: boolean
}

export interface UserProfileResponse {
  id: string
  tenant_id: string
  email: string
  username: string | null
  full_name: string
  roles: string[]
  permissions: string[]
}

export interface TenantOption {
  id: string
  name: string
  countryCode: string
}

export interface MessageResponse {
  message: string
}

function authHeaders(tenantId: string = DEFAULT_TENANT_ID) {
  return {
    'X-Tenant-ID': tenantId,
  }
}

async function establishSession(
  tokens: TokenResponse,
  tenantId: string = DEFAULT_TENANT_ID,
): Promise<{ tokens: TokenResponse; user: AuthUser; tenantId: string }> {
  const profile = await apiClient<UserProfileResponse>(API_ENDPOINTS.auth.me, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      ...authHeaders(tenantId),
    },
  })

  return {
    tokens,
    tenantId: profile.tenant_id,
    user: {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      roles: profile.roles,
      permissions: profile.permissions,
    },
  }
}

export async function login(
  identifier: string,
  password: string,
  tenantId: string = DEFAULT_TENANT_ID,
): Promise<{ tokens: TokenResponse; user: AuthUser; tenantId: string }> {
  const body = identifier.includes('@')
    ? { email: identifier, password }
    : { username: identifier, password }

  const tokens = await apiClient<TokenResponse>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body,
    headers: authHeaders(tenantId),
  })

  return establishSession(tokens, tenantId)
}

export async function register(
  payload: RegisterPayload,
  tenantId: string = DEFAULT_TENANT_ID,
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>(API_ENDPOINTS.auth.register, {
    method: 'POST',
    body: payload,
    headers: authHeaders(tenantId),
  })
}

export async function googleSignIn(
  idToken: string,
  tenantId: string = DEFAULT_TENANT_ID,
): Promise<{ tokens: TokenResponse; user: AuthUser; tenantId: string }> {
  const tokens = await apiClient<TokenResponse>(API_ENDPOINTS.auth.google, {
    method: 'POST',
    body: { id_token: idToken },
    headers: authHeaders(tenantId),
  })

  return establishSession(tokens, tenantId)
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return apiClient<TokenResponse>(API_ENDPOINTS.auth.refresh, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    headers: authHeaders(),
  })
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient(API_ENDPOINTS.auth.logout, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    headers: authHeaders(),
  })
}

export async function fetchTenants(): Promise<TenantOption[]> {
  return apiClient<TenantOption[]>(API_ENDPOINTS.auth.tenants, {
    headers: authHeaders(),
  })
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient(API_ENDPOINTS.auth.forgotPassword, {
    method: 'POST',
    body: { email },
    headers: authHeaders(),
  })
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  return apiClient<MessageResponse>(API_ENDPOINTS.auth.verifyEmail, {
    method: 'POST',
    body: { token },
    headers: authHeaders(),
  })
}

export async function verifyMfa(code: string): Promise<{ verified: boolean }> {
  return authorizedRequest(API_ENDPOINTS.auth.mfa, {
    method: 'POST',
    body: { code },
  })
}

export async function fetchCurrentUser(): Promise<UserProfileResponse> {
  return authorizedRequest<UserProfileResponse>(API_ENDPOINTS.auth.me)
}
