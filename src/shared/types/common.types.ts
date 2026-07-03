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
  projectId?: string
  municipalityId?: string
  departmentId?: string
  countryCode?: string
  sectorId?: string
  dateFrom?: string
  dateTo?: string
  eventType?: string
}
