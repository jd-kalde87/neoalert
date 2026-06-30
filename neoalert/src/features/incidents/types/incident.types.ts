export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export type IncidentStatus =
  | 'open'
  | 'in_review'
  | 'in_progress'
  | 'resolved'
  | 'closed'

export interface IncidentTimelineEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  note?: string
}

export interface Incident {
  id: string
  code: string
  title: string
  description: string
  type: string
  severity: IncidentSeverity
  status: IncidentStatus
  source: string
  location: string
  latitude: number
  longitude: number
  blocksTransit: boolean
  routeName?: string
  targetWorkSite?: string
  reportedBy?: string
  reportedAt: string
  updatedAt: string
  assignee?: string
  zoneId?: string
  zoneLabel?: string
  siteId?: string
  crewId?: string
  timeline: IncidentTimelineEvent[]
}

export interface CreateIncidentDto {
  title: string
  description: string
  type: string
  severity: IncidentSeverity
  source: string
  location: string
  latitude: number
  longitude: number
  blocksTransit: boolean
  routeName?: string
  targetWorkSite?: string
  reportedBy?: string
  zoneId?: string
  zoneLabel?: string
  siteId?: string
}

export interface IncidentListFilters {
  severity?: IncidentSeverity
  status?: IncidentStatus
  search?: string
}

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Activo',
  in_review: 'En verificación',
  in_progress: 'Monitoreo activo',
  resolved: 'Riesgo mitigado',
  closed: 'Cerrado',
}

/** Nivel de riesgo para el personal en ruta */
export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
  critical: 'Riesgo crítico',
}

export const INCIDENT_SEVERITY_HINTS: Record<IncidentSeverity, string> = {
  low: 'Monitorear condiciones',
  medium: 'Transitar con precaución',
  high: 'Evitar la zona si es posible',
  critical: 'No transitar — ruta bloqueada',
}

export const SECURITY_INCIDENT_TYPES = [
  'Bloqueo vial',
  'Altercado / disturbios',
  'Enfrentamiento armado',
  'Presencia de grupo armado',
  'Restricción de acceso',
  'Riesgo en ruta',
  'Otro',
] as const

export const ROUTE_OPTIONS = [
  'Ruta Planta → Sitio Alpha',
  'Ruta Planta → Sitio Beta',
  'Ruta Planta → Sitio Gamma',
  'Ruta Planta → Sitio Delta',
] as const

export const WORK_SITE_OPTIONS = [
  'Sitio Alpha — Campo Norte',
  'Sitio Beta — Corredor Central',
  'Sitio Gamma — Sector Sur',
  'Sitio Delta — Vía Oriental',
] as const

export const REPORT_SOURCE_OPTIONS = [
  'Jefe de área',
  'Administrador',
  'Centro de monitoreo',
  'Coordinación de seguridad',
] as const

/** Alias semántico para UI de seguridad */
export const RISK_LEVEL_LABELS = INCIDENT_SEVERITY_LABELS
