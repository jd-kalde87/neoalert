export type AsyncStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'empty'
  | 'offline'
  | 'syncing'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface GlobalFilters {
  tenantId?: string
  zoneId?: string
  siteId?: string
  countryCode?: string
  crewId?: string
  dateFrom?: string
  dateTo?: string
  eventType?: string
}
