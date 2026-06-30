import type { GlobalFilters } from '@shared/types/common.types'

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export function filtersToParams(filters: GlobalFilters = {}): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.tenantId) params.tenantId = filters.tenantId
  if (filters.zoneId) params.zoneId = filters.zoneId
  if (filters.siteId) params.siteId = filters.siteId
  if (filters.countryCode) params.countryCode = filters.countryCode
  if (filters.crewId) params.crewId = filters.crewId
  if (filters.dateFrom) params.dateFrom = filters.dateFrom
  if (filters.dateTo) params.dateTo = filters.dateTo
  if (filters.eventType) params.eventType = filters.eventType

  return params
}

export function parseApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback

  const record = payload as Record<string, unknown>
  const detail = record.detail ?? record.message

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg?: string }).msg ?? '')
        }
        return ''
      })
      .filter(Boolean)
      .join(', ')
  }

  return fallback
}

export function useMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API === 'true'
}
