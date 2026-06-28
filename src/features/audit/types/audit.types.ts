export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'import'
  | 'export'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'
  | 'notify'

export type AuditEntity =
  | 'incident'
  | 'attendance'
  | 'import'
  | 'import_template'
  | 'notification'
  | 'report'
  | 'user'
  | 'route'

export type AuditOutcome = 'success' | 'failure' | 'warning'

export interface AuditFieldChange {
  field: string
  label: string
  previous?: string
  next?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actor: string
  actorEmail: string
  actorRole: string
  action: AuditAction
  entity: AuditEntity
  entityId: string
  entityLabel: string
  summary: string
  outcome: AuditOutcome
  ipAddress?: string
  userAgent?: string
  zoneId?: string
  siteId?: string
  changes?: AuditFieldChange[]
  metadata?: Record<string, string>
}

export interface AuditListFilters {
  search?: string
  entity?: AuditEntity
  action?: AuditAction
  outcome?: AuditOutcome
  actor?: string
}

export interface AuditSummary {
  totalEvents: number
  todayEvents: number
  criticalActions: number
  failedEvents: number
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  status_change: 'Cambio de estado',
  import: 'Importación',
  export: 'Exportación',
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  approve: 'Aprobación',
  reject: 'Rechazo',
  notify: 'Notificación',
}

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  incident: 'Incidente de seguridad',
  attendance: 'Asistencia',
  import: 'Importación',
  import_template: 'Plantilla',
  notification: 'Notificación',
  report: 'Reporte',
  user: 'Usuario',
  route: 'Ruta operativa',
}

export const AUDIT_OUTCOME_LABELS: Record<AuditOutcome, string> = {
  success: 'Exitoso',
  failure: 'Fallido',
  warning: 'Advertencia',
}
