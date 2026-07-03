export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'

export type RiskStatus = 'active' | 'monitored' | 'mitigated' | 'closed'

export interface Risk {
  id: string
  title: string
  description: string
  type: string
  severity: RiskSeverity
  status: RiskStatus
  latitude: number
  longitude: number
  municipalityId?: string
  municipalityLabel?: string
  departmentId?: string
  projectId?: string
  sectorId?: string
  source?: string
  reportedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateRiskDto {
  title: string
  description?: string
  type: string
  severity: RiskSeverity
  latitude: number
  longitude: number
  municipalityId?: string
  departmentId?: string
  projectId?: string
  sectorId?: string
  source?: string
  reportedBy?: string
}

export const RISK_TYPES = [
  'Bloqueo vial',
  'Riesgo armado',
  'Altercado / disturbio',
  'Restricción de acceso',
  'Inundación / derrumbe',
  'Robo / hurto',
  'Zona de alto tránsito',
  'Otro',
] as const

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
  critical: 'Riesgo crítico',
}

export const RISK_SEVERITY_HINTS: Record<RiskSeverity, string> = {
  low: 'Monitoreo rutinario',
  medium: 'Precaución al transitar',
  high: 'Evitar la zona si es posible',
  critical: 'No transitar — alerta inmediata',
}

export const RISK_STATUS_LABELS: Record<RiskStatus, string> = {
  active: 'Activo',
  monitored: 'En monitoreo',
  mitigated: 'Mitigado',
  closed: 'Cerrado',
}

export const REPORT_SOURCE_OPTIONS = [
  'Administrador',
  'Supervisor',
  'Jefe de área',
  'Operador de campo',
  'Centro de control',
] as const
