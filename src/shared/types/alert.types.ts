export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 'incident' | 'attendance' | 'import' | 'approval' | 'system'

export interface AlertItem {
  id: string
  title: string
  message: string
  type: AlertType
  severity: AlertSeverity
  timestamp: string
  read: boolean
}
