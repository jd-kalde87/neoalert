import type { AlertSeverity } from '@shared/types/alert.types'

export interface NewsItem {
  id: string
  country: string
  department: string
  municipality: string
  activity: string
  date: string | null
  severity: AlertSeverity
  departmentKey: string
  municipalityKey: string
}

export interface NewsDataset {
  source: string
  sheet: string
  updatedAt: string
  total: number
  items: NewsItem[]
}

export interface NewsFilters {
  search?: string
  departmentKey?: string
  municipalityKey?: string
  severity?: AlertSeverity | 'all'
  dateFrom?: string
  dateTo?: string
}

export interface RegionalNewsContext {
  countryCode?: string
  departmentId?: string
  departmentLabel?: string
  municipalityId?: string
  municipalityLabel?: string
  projectId?: string
  projectLabel?: string
}
