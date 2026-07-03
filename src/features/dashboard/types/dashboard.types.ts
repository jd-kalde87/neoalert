import type { AlertItem } from '@shared/types/alert.types'

export type { AlertSeverity, AlertType } from '@shared/types/alert.types'

export interface DashboardAlert extends AlertItem {
  zoneId?: string
  siteId?: string
  crewId?: string
}

export type KpiTrendDirection = 'up' | 'down' | 'neutral'

export interface DashboardKpi {
  id: string
  label: string
  value: string | number
  hint?: string
  trend?: {
    direction: KpiTrendDirection
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export interface DashboardSummary {
  kpis: DashboardKpi[]
  alerts: DashboardAlert[]
  mapSummary: {
    activeRisks: number
    municipalitiesMonitored: number
    sectorsOnField: number
  }
}
