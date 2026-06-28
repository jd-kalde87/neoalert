import type { AlertSeverity } from '@shared/types/alert.types'

export type NotificationType =
  | 'security_incident'
  | 'route_block'
  | 'risk_alert'
  | 'status_update'
  | 'system'

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  severity: AlertSeverity
  timestamp: string
  read: boolean
  incidentId?: string
  routeName?: string
  zoneId?: string
  siteId?: string
  blocksTransit?: boolean
}

export interface NotificationFilters {
  read?: 'all' | 'read' | 'unread'
  severity?: AlertSeverity
  type?: NotificationType
  search?: string
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  security_incident: 'Incidente de seguridad',
  route_block: 'Ruta bloqueada',
  risk_alert: 'Alerta de riesgo',
  status_update: 'Actualización',
  system: 'Sistema',
}
