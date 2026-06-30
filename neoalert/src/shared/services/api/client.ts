import type { ApiError } from '@shared/types/common.types'
import { API_BASE_URL } from '@shared/config/api.config'

const DEFAULT_BASE_URL = API_BASE_URL

export class HttpClientError extends Error implements ApiError {
  code?: string
  status?: number

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'HttpClientError'
    this.status = status
    this.code = code
  }
}

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

function buildUrl(path: string, params?: RequestConfig['params']) {
  const base = DEFAULT_BASE_URL.startsWith('http')
    ? DEFAULT_BASE_URL.replace(/\/$/, '')
    : `${window.location.origin}${DEFAULT_BASE_URL}`.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${normalizedPath}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

export async function apiClient<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { params, body, headers, ...rest } = config

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const requestHeaders = new Headers(headers)

  if (!isFormData && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  if (!response.ok) {
    let message = `Error ${response.status}`

    try {
      const payload = (await response.json()) as {
        message?: string
        detail?: string | { msg: string }[]
        code?: string
      }
      if (typeof payload.detail === 'string') {
        message = payload.detail
      } else if (Array.isArray(payload.detail) && payload.detail[0]?.msg) {
        message = payload.detail[0].msg
      } else {
        message = payload.message ?? message
      }
      throw new HttpClientError(message, response.status, payload.code)
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error
      }
      throw new HttpClientError(message, response.status)
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
