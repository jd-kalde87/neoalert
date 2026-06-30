import type { GlobalFilters } from '@shared/types/common.types'

export function toQueryParams(
  filters: GlobalFilters & Record<string, string | undefined> = {},
): Record<string, string | number | boolean | undefined> {
  const params: Record<string, string | number | boolean | undefined> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params[key] = value
    }
  })

  return params
}
