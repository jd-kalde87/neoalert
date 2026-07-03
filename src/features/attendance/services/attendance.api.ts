import { matchesTerritoryFilters } from '@shared/utils/territoryFilters'
import type { GlobalFilters } from '@shared/types/common.types'
import type {
  AttendanceListFilters,
  AttendanceRecord,
  CreateAttendanceMarkDto,
  RouteSafetyValidation,
} from '../types/attendance.types'
import { validateRouteSafety } from './route-safety.validation'

const now = () => new Date().toISOString()

const seedRecords: AttendanceRecord[] = [
  {
    id: 'att-001',
    userId: 'user-1',
    userName: 'Juan Pérez',
    markType: 'entry',
    status: 'rejected',
    routeName: 'Ruta Planta → Sitio Alpha',
    targetWorkSite: 'Sitio Alpha — Campo Norte',
    siteId: 'site-alpha',
    locationLabel: 'Planta central — acceso norte',
    latitude: 4.695,
    longitude: -74.13,
    gpsAccuracyMeters: 12,
    networkOnline: true,
    markedAt: '2026-06-28T07:30:00Z',
    validation: {
      allowed: false,
      level: 'blocked',
      message: 'Ruta bloqueada hacia Sitio Alpha',
      blockingIncidents: [{ id: 'inc-001', code: 'SEG-001', title: 'Bloqueo total en vía hacia Sitio Alpha' }],
      warningIncidents: [],
    },
    rejectedReason: 'Incidente SEG-001 bloquea la ruta. Personal debe permanecer en planta.',
  },
  {
    id: 'att-002',
    userId: 'user-2',
    userName: 'Ana Gómez',
    markType: 'entry',
    status: 'requires_approval',
    routeName: 'Ruta Planta → Sitio Beta',
    targetWorkSite: 'Sitio Beta — Corredor Central',
    siteId: 'site-beta',
    locationLabel: 'Km 3 vía Planta–Beta',
    latitude: 4.67,
    longitude: -74.115,
    gpsAccuracyMeters: 18,
    networkOnline: true,
    markedAt: '2026-06-28T07:50:00Z',
    validation: {
      allowed: true,
      level: 'warning',
      message: 'Precaución en ruta',
      blockingIncidents: [],
      warningIncidents: [
        { id: 'inc-002', code: 'SEG-002', title: 'Presencia de grupo armado', severity: 'critical' },
      ],
    },
    justification: 'Desplazamiento con escolta autorizada',
  },
  {
    id: 'att-003',
    userId: 'user-3',
    userName: 'Luis Martínez',
    markType: 'entry',
    status: 'synced',
    routeName: 'Ruta Planta → Sitio Gamma',
    targetWorkSite: 'Sitio Gamma — Sector Sur',
    siteId: 'site-gamma',
    locationLabel: 'Sitio Gamma — garita principal',
    latitude: 4.58,
    longitude: -74.15,
    gpsAccuracyMeters: 8,
    networkOnline: true,
    markedAt: '2026-06-28T06:45:00Z',
    syncedAt: '2026-06-28T06:45:05Z',
    validation: {
      allowed: true,
      level: 'clear',
      message: 'Ruta validada',
      blockingIncidents: [],
      warningIncidents: [],
    },
  },
  {
    id: 'att-004',
    userId: 'user-4',
    userName: 'Carla Díaz',
    markType: 'exit',
    status: 'offline_pending',
    routeName: 'Ruta Planta → Sitio Delta',
    targetWorkSite: 'Sitio Delta — Vía Oriental',
    siteId: 'site-delta',
    locationLabel: 'Sitio Delta',
    latitude: 4.62,
    longitude: -73.98,
    gpsAccuracyMeters: 25,
    networkOnline: false,
    markedAt: '2026-06-28T08:00:00Z',
    validation: {
      allowed: true,
      level: 'warning',
      message: 'Precaución en ruta',
      blockingIncidents: [],
      warningIncidents: [],
    },
  },
]

let attendanceDb = [...seedRecords]

function applyGlobalFilters(records: AttendanceRecord[], filters: GlobalFilters) {
  return records.filter((record) => matchesTerritoryFilters(record, filters))
}

function applyLocalFilters(records: AttendanceRecord[], filters: AttendanceListFilters) {
  return records.filter((record) => {
    if (filters.status && record.status !== filters.status) return false
    if (filters.markType && record.markType !== filters.markType) return false
    if (filters.search) {
      const term = filters.search.toLowerCase()
      const haystack = `${record.userName} ${record.routeName} ${record.locationLabel}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })
}

function resolveStatus(
  validation: RouteSafetyValidation,
  payload: CreateAttendanceMarkDto,
): AttendanceRecord['status'] {
  if (!validation.allowed) {
    if (payload.forceExceptional && payload.justification?.trim()) {
      return 'requires_approval'
    }
    return 'rejected'
  }
  if (!payload.networkOnline) return 'offline_pending'
  if (validation.level === 'warning' && !payload.justification?.trim()) {
    return 'requires_approval'
  }
  return 'synced'
}

export async function fetchAttendanceRecords(
  globalFilters: GlobalFilters,
  localFilters: AttendanceListFilters = {},
) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const filtered = applyLocalFilters(
    applyGlobalFilters(attendanceDb, globalFilters),
    localFilters,
  )
  return filtered.sort(
    (a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime(),
  )
}

export async function createAttendanceMark(
  payload: CreateAttendanceMarkDto,
  user: { id: string; name: string },
) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const validation = await validateRouteSafety(payload.routeName, payload.targetWorkSite)
  const status = resolveStatus(validation, payload)

  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    markType: payload.markType,
    status,
    routeName: payload.routeName,
    targetWorkSite: payload.targetWorkSite,
    siteId: payload.siteId,
    locationLabel: payload.locationLabel,
    latitude: payload.latitude,
    longitude: payload.longitude,
    gpsAccuracyMeters: payload.gpsAccuracyMeters,
    networkOnline: payload.networkOnline,
    markedAt: now(),
    syncedAt: status === 'synced' ? now() : undefined,
    justification: payload.justification,
    validation,
    rejectedReason:
      status === 'rejected'
        ? validation.blockingIncidents
            .map((item) => `${item.code}: ${item.title}`)
            .join(' · ') || validation.message
        : undefined,
  }

  attendanceDb = [record, ...attendanceDb]
  return record
}

export { validateRouteSafety }
