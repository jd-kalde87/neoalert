import type { GlobalFilters } from '@shared/types/common.types'
import type {
  NotificationFilters,
  NotificationItem,
  NotificationType,
} from '../types/notification.types'
import { USE_MOCK_API } from '@shared/config/api.config'
import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import { toQueryParams } from '@shared/utils/query-params'

const now = () => new Date().toISOString()

const seedNotifications: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'Ruta bloqueada — Sitio Alpha',
    message:
      'Bloqueo total en corredor norte. El personal no debe salir de planta central hacia Sitio Alpha.',
    type: 'route_block',
    severity: 'critical',
    timestamp: '2026-06-28T09:15:00Z',
    read: false,
    incidentId: 'inc-001',
    routeName: 'Ruta Planta → Sitio Alpha',
    zoneId: 'zone-norte',
    siteId: 'site-alpha',
    blocksTransit: true,
  },
  {
    id: 'notif-002',
    title: 'Grupo armado reportado',
    message: 'Presencia armada en vía alterna hacia Sitio Beta. Convoyes suspendidos.',
    type: 'security_incident',
    severity: 'critical',
    timestamp: '2026-06-28T08:50:00Z',
    read: false,
    incidentId: 'inc-002',
    routeName: 'Ruta Planta → Sitio Beta',
    zoneId: 'zone-centro',
    siteId: 'site-beta',
    blocksTransit: true,
  },
  {
    id: 'notif-003',
    title: 'Precaución en corredor sur',
    message: 'Altercado en cruce hacia Sitio Gamma. Ruta alterna con escolta disponible.',
    type: 'risk_alert',
    severity: 'high',
    timestamp: '2026-06-28T07:00:00Z',
    read: false,
    incidentId: 'inc-003',
    routeName: 'Ruta Planta → Sitio Gamma',
    zoneId: 'zone-sur',
    siteId: 'site-gamma',
    blocksTransit: false,
  },
  {
    id: 'notif-004',
    title: 'Retén en corredor oriental',
    message: 'Acceso a Sitio Delta restringido. Solo personal autorizado con escolta.',
    type: 'security_incident',
    severity: 'medium',
    timestamp: '2026-06-28T06:25:00Z',
    read: true,
    incidentId: 'inc-004',
    zoneId: 'zone-oriente',
    siteId: 'site-delta',
  },
  {
    id: 'notif-005',
    title: 'Incidente en verificación',
    message: 'Enfrentamiento armado paralelo a Ruta Alpha — monitoreo activo.',
    type: 'status_update',
    severity: 'high',
    timestamp: '2026-06-28T05:45:00Z',
    read: true,
    incidentId: 'inc-005',
    zoneId: 'zone-norte',
    siteId: 'site-alpha',
  },
  {
    id: 'notif-006',
    title: 'Sincronización con app móvil',
    message: 'Canal push listo para entrega a colaboradores en campo (fase móvil).',
    type: 'system',
    severity: 'low',
    timestamp: '2026-06-28T05:00:00Z',
    read: true,
  },
]

let notificationsDb = [...seedNotifications]

function applyGlobalFilters(items: NotificationItem[], filters: GlobalFilters) {
  return items.filter((item) => {
    if (filters.zoneId && item.zoneId && item.zoneId !== filters.zoneId) return false
    if (filters.siteId && item.siteId && item.siteId !== filters.siteId) return false
    return true
  })
}

function applyLocalFilters(items: NotificationItem[], filters: NotificationFilters) {
  return items.filter((item) => {
    if (filters.read === 'read' && !item.read) return false
    if (filters.read === 'unread' && item.read) return false
    if (filters.severity && item.severity !== filters.severity) return false
    if (filters.type && item.type !== filters.type) return false
    if (filters.search) {
      const term = filters.search.toLowerCase()
      const haystack = `${item.title} ${item.message} ${item.routeName ?? ''}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })
}

export async function fetchNotifications(
  globalFilters: GlobalFilters,
  localFilters: NotificationFilters = {},
) {
  if (!USE_MOCK_API) {
    return authorizedRequest<NotificationItem[]>(API_ENDPOINTS.notifications.list, {
      params: toQueryParams({ ...globalFilters, ...localFilters }),
    })
  }

  await new Promise((resolve) => setTimeout(resolve, 280))
  const filtered = applyLocalFilters(
    applyGlobalFilters(notificationsDb, globalFilters),
    localFilters,
  )
  return filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export async function fetchUnreadCount(globalFilters: GlobalFilters) {
  const items = await fetchNotifications(globalFilters, { read: 'unread' })
  return items.length
}

export async function markNotificationRead(id: string) {
  if (!USE_MOCK_API) {
    await authorizedRequest<void>(API_ENDPOINTS.notifications.markRead(id), {
      method: 'PATCH',
    })
    return
  }

  await new Promise((resolve) => setTimeout(resolve, 150))
  notificationsDb = notificationsDb.map((item) =>
    item.id === id ? { ...item, read: true } : item,
  )
}

export async function markAllNotificationsRead() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  notificationsDb = notificationsDb.map((item) => ({ ...item, read: true }))
}

export async function createSecurityNotification(payload: {
  title: string
  message: string
  type: NotificationType
  severity: NotificationItem['severity']
  incidentId?: string
  routeName?: string
  zoneId?: string
  siteId?: string
  blocksTransit?: boolean
}) {
  const notification: NotificationItem = {
    id: crypto.randomUUID(),
    title: payload.title,
    message: payload.message,
    type: payload.type,
    severity: payload.severity,
    timestamp: now(),
    read: false,
    incidentId: payload.incidentId,
    routeName: payload.routeName,
    zoneId: payload.zoneId,
    siteId: payload.siteId,
    blocksTransit: payload.blocksTransit,
  }
  notificationsDb = [notification, ...notificationsDb]
  return notification
}

export function resetNotificationsMock() {
  notificationsDb = [...seedNotifications]
}
