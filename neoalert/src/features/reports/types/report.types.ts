export type ReportType = 'attendance' | 'security-incidents' | 'route-safety'

export interface ReportKpiItem {
  id: string
  label: string
  value: string | number
  hint?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export interface ReportSeriesPoint {
  label: string
  value: number
}

export interface ReportBreakdownRow {
  id: string
  label: string
  value: number
  percentage?: number
}

export interface ReportData {
  type: ReportType
  title: string
  description: string
  generatedAt: string
  kpis: ReportKpiItem[]
  series: ReportSeriesPoint[]
  breakdown: ReportBreakdownRow[]
}

export const REPORT_TYPE_META: Record<
  ReportType,
  { title: string; description: string; slug: ReportType }
> = {
  attendance: {
    slug: 'attendance',
    title: 'Asistencia en ruta',
    description: 'Marcaciones, rechazos por incidentes, aprobaciones y sincronización.',
  },
  'security-incidents': {
    slug: 'security-incidents',
    title: 'Incidentes de seguridad',
    description: 'Incidentes por tipo, riesgo, corredor y rutas bloqueadas.',
  },
  'route-safety': {
    slug: 'route-safety',
    title: 'Seguridad de rutas',
    description: 'Estado de corredores planta → sitios y impacto operativo.',
  },
}

export type ExportFormat = 'csv' | 'excel' | 'pdf'
