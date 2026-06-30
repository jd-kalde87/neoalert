export type AttendanceMarkType =
  | 'entry'
  | 'exit'
  | 'intermediate_exit'
  | 'reentry'
  | 'exceptional'

export type AttendanceSyncStatus =
  | 'pending'
  | 'syncing'
  | 'synced'
  | 'offline_pending'
  | 'rejected'
  | 'requires_approval'

export interface RouteSafetyValidation {
  allowed: boolean
  level: 'clear' | 'warning' | 'blocked'
  message: string
  blockingIncidents: {
    id: string
    code: string
    title: string
    routeName?: string
  }[]
  warningIncidents: {
    id: string
    code: string
    title: string
    severity: string
  }[]
}

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  markType: AttendanceMarkType
  status: AttendanceSyncStatus
  routeName: string
  targetWorkSite: string
  siteId?: string
  locationLabel: string
  latitude: number
  longitude: number
  gpsAccuracyMeters: number
  networkOnline: boolean
  markedAt: string
  syncedAt?: string
  justification?: string
  validation: RouteSafetyValidation
  rejectedReason?: string
}

export interface CreateAttendanceMarkDto {
  markType: AttendanceMarkType
  routeName: string
  targetWorkSite: string
  siteId?: string
  locationLabel: string
  latitude: number
  longitude: number
  gpsAccuracyMeters: number
  networkOnline: boolean
  justification?: string
  forceExceptional?: boolean
}

export interface AttendanceListFilters {
  status?: AttendanceSyncStatus
  markType?: AttendanceMarkType
  search?: string
}

export const MARK_TYPE_LABELS: Record<AttendanceMarkType, string> = {
  entry: 'Entrada',
  exit: 'Salida',
  intermediate_exit: 'Salida intermedia',
  reentry: 'Reingreso',
  exceptional: 'Marcación excepcional',
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceSyncStatus, string> = {
  pending: 'En proceso',
  syncing: 'Sincronizando',
  synced: 'Sincronizado',
  offline_pending: 'Pendiente de conexión',
  rejected: 'Rechazado',
  requires_approval: 'Requiere aprobación',
}

export const ROUTE_OPTIONS = [
  'Ruta Planta → Sitio Alpha',
  'Ruta Planta → Sitio Beta',
  'Ruta Planta → Sitio Gamma',
  'Ruta Planta → Sitio Delta',
] as const

export const WORK_SITE_OPTIONS = [
  { id: 'site-alpha', label: 'Sitio Alpha — Campo Norte' },
  { id: 'site-beta', label: 'Sitio Beta — Corredor Central' },
  { id: 'site-gamma', label: 'Sitio Gamma — Sector Sur' },
  { id: 'site-delta', label: 'Sitio Delta — Vía Oriental' },
] as const
