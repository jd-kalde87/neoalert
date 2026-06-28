import type { ApiError } from '@shared/types/common.types'

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

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
  const url = new URL(path, DEFAULT_BASE_URL.startsWith('http') ? DEFAULT_BASE_URL : `${window.location.origin}${DEFAULT_BASE_URL}`)

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

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Error ${response.status}`

    try {
      const payload = (await response.json()) as { message?: string; code?: string }
      message = payload.message ?? message
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
