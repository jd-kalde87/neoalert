import type { GlobalFilters } from '@shared/types/common.types'
import type {
  CreateIncidentDto,
  Incident,
  IncidentListFilters,
  IncidentTimelineEvent,
} from '../types/incident.types'

const now = () => new Date().toISOString()

function createTimelineEvent(
  actor: string,
  action: string,
  note?: string,
): IncidentTimelineEvent {
  return {
    id: crypto.randomUUID(),
    timestamp: now(),
    actor,
    action,
    note,
  }
}

const seedIncidents: Incident[] = [
  {
    id: 'inc-001',
    code: 'SEG-001',
    title: 'Bloqueo total en vía hacia Sitio Alpha',
    description:
      'Manifestación con cierre de calzada en corredor norte. Impide salida segura desde planta hacia Sitio Alpha.',
    type: 'Bloqueo vial',
    severity: 'critical',
    status: 'open',
    source: 'Centro de monitoreo',
    location: 'Km 12 vía Planta–Alpha, sector Suba',
    latitude: 4.735,
    longitude: -74.095,
    blocksTransit: true,
    routeName: 'Ruta Planta → Sitio Alpha',
    targetWorkSite: 'Sitio Alpha — Campo Norte',
    reportedBy: 'Coordinación de seguridad',
    reportedAt: '2026-06-28T08:10:00Z',
    updatedAt: '2026-06-28T08:10:00Z',
    assignee: 'María López — Jefe de área',
    zoneId: 'zone-norte',
    zoneLabel: 'Corredor Norte',
    siteId: 'site-alpha',
    timeline: [
      createTimelineEvent(
        'Centro de monitoreo',
        'Incidente de seguridad registrado',
        'Ruta bloqueada — personal debe permanecer en planta',
      ),
      createTimelineEvent('María López', 'Notificación enviada a cuadrillas'),
    ],
  },
  {
    id: 'inc-002',
    code: 'SEG-002',
    title: 'Presencia de grupo armado en vía secundaria',
    description:
      'Reporte de individuos armados en tramo alterno hacia Sitio Beta. Riesgo alto para convoyes de personal.',
    type: 'Presencia de grupo armado',
    severity: 'critical',
    status: 'in_review',
    source: 'Jefe de área',
    location: 'Desvío La Prosperidad, acceso a Sitio Beta',
    latitude: 4.668,
    longitude: -74.105,
    blocksTransit: true,
    routeName: 'Ruta Planta → Sitio Beta',
    targetWorkSite: 'Sitio Beta — Corredor Central',
    reportedBy: 'Carlos Ruiz',
    reportedAt: '2026-06-28T07:45:00Z',
    updatedAt: '2026-06-28T09:00:00Z',
    assignee: 'Carlos Ruiz',
    zoneId: 'zone-centro',
    zoneLabel: 'Corredor Central',
    siteId: 'site-beta',
    timeline: [
      createTimelineEvent('Carlos Ruiz', 'Incidente reportado desde campo'),
      createTimelineEvent('Administrador', 'En verificación con Policía / seguridad privada'),
    ],
  },
  {
    id: 'inc-003',
    code: 'SEG-003',
    title: 'Altercado en punto de control informal',
    description:
      'Disturbios entre terceros en cruce hacia Sitio Gamma. No bloqueo total pero requiere desvío y precaución.',
    type: 'Altercado / disturbios',
    severity: 'high',
    status: 'in_progress',
    source: 'Coordinación de seguridad',
    location: 'Cruce Mondoñedo — acceso sur',
    latitude: 4.612,
    longitude: -74.128,
    blocksTransit: false,
    routeName: 'Ruta Planta → Sitio Gamma',
    targetWorkSite: 'Sitio Gamma — Sector Sur',
    reportedAt: '2026-06-28T06:55:00Z',
    updatedAt: '2026-06-28T08:30:00Z',
    zoneId: 'zone-sur',
    zoneLabel: 'Corredor Sur',
    siteId: 'site-gamma',
    timeline: [
      createTimelineEvent('Coordinación de seguridad', 'Alerta emitida'),
      createTimelineEvent('Monitoreo', 'Ruta alterna habilitada con escolta'),
    ],
  },
  {
    id: 'inc-004',
    code: 'SEG-004',
    title: 'Restricción de acceso por retén no autorizado',
    description:
      'Retén en vía oriental limita acceso al Sitio Delta. Personal autorizado solo con escolta.',
    type: 'Restricción de acceso',
    severity: 'medium',
    status: 'open',
    source: 'Administrador',
    location: 'Km 8 corredor oriental',
    latitude: 4.635,
    longitude: -74.01,
    blocksTransit: false,
    routeName: 'Ruta Planta → Sitio Delta',
    targetWorkSite: 'Sitio Delta — Vía Oriental',
    reportedAt: '2026-06-28T06:20:00Z',
    updatedAt: '2026-06-28T06:20:00Z',
    zoneId: 'zone-oriente',
    zoneLabel: 'Corredor Oriental',
    siteId: 'site-delta',
    timeline: [createTimelineEvent('Administrador', 'Incidente registrado en web')],
  },
  {
    id: 'inc-005',
    code: 'SEG-005',
    title: 'Enfrentamiento armado lejos de ruta principal',
    description:
      'Combates reportados a 2 km de la ruta hacia Sitio Alpha. Sin bloqueo directo pero riesgo de dispersión.',
    type: 'Enfrentamiento armado',
    severity: 'high',
    status: 'in_review',
    source: 'Centro de monitoreo',
    location: 'Sector veredal El Uval, paralelo a Ruta Alpha',
    latitude: 4.752,
    longitude: -74.045,
    blocksTransit: false,
    routeName: 'Ruta Planta → Sitio Alpha',
    targetWorkSite: 'Sitio Alpha — Campo Norte',
    reportedAt: '2026-06-28T05:40:00Z',
    updatedAt: '2026-06-28T07:10:00Z',
    zoneId: 'zone-norte',
    zoneLabel: 'Corredor Norte',
    siteId: 'site-alpha',
    timeline: [
      createTimelineEvent('Centro de monitoreo', 'Alerta por cercanía a ruta operativa'),
    ],
  },
]

let incidentsDb = [...seedIncidents]

function applyGlobalFilters(incidents: Incident[], filters: GlobalFilters) {
  return incidents.filter((incident) => {
    if (filters.zoneId && incident.zoneId !== filters.zoneId) return false
    if (filters.siteId && incident.siteId && incident.siteId !== filters.siteId) return false
    return true
  })
}

function applyLocalFilters(incidents: Incident[], filters: IncidentListFilters) {
  return incidents.filter((incident) => {
    if (filters.severity && incident.severity !== filters.severity) return false
    if (filters.status && incident.status !== filters.status) return false
    if (filters.search) {
      const term = filters.search.toLowerCase()
      const haystack =
        `${incident.code} ${incident.title} ${incident.location} ${incident.routeName ?? ''}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })
}

export async function fetchIncidents(
  globalFilters: GlobalFilters,
  localFilters: IncidentListFilters = {},
) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const filtered = applyLocalFilters(applyGlobalFilters(incidentsDb, globalFilters), localFilters)
  return filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export async function fetchIncidentById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const incident = incidentsDb.find((item) => item.id === id)
  if (!incident) {
    throw new Error('Incidente de seguridad no encontrado')
  }
  return incident
}

export async function createIncident(payload: CreateIncidentDto) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const nextNumber = incidentsDb.length + 1
  const id = `inc-${String(nextNumber).padStart(3, '0')}`
  const incident: Incident = {
    id,
    code: `SEG-${String(nextNumber).padStart(3, '0')}`,
    title: payload.title,
    description: payload.description,
    type: payload.type,
    severity: payload.severity,
    status: 'open',
    source: payload.source,
    location: payload.location,
    latitude: payload.latitude,
    longitude: payload.longitude,
    blocksTransit: payload.blocksTransit,
    routeName: payload.routeName,
    targetWorkSite: payload.targetWorkSite,
    reportedBy: payload.reportedBy,
    reportedAt: now(),
    updatedAt: now(),
    timeline: [
      createTimelineEvent(
        payload.reportedBy ?? payload.source,
        'Incidente de seguridad registrado',
        payload.blocksTransit
          ? 'Bloquea el desplazamiento del personal'
          : 'Precaución en ruta — no bloqueo total',
      ),
    ],
  }

  incidentsDb = [incident, ...incidentsDb]
  return incident
}

export async function addIncidentComment(id: string, note: string, actor = 'Administrador') {
  await new Promise((resolve) => setTimeout(resolve, 250))
  incidentsDb = incidentsDb.map((incident) => {
    if (incident.id !== id) return incident
    return {
      ...incident,
      updatedAt: now(),
      timeline: [...incident.timeline, createTimelineEvent(actor, 'Observación agregada', note)],
    }
  })
  return fetchIncidentById(id)
}

export async function updateIncidentStatus(
  id: string,
  status: Incident['status'],
  note?: string,
  actor = 'Jefe de área',
) {
  await new Promise((resolve) => setTimeout(resolve, 250))
  incidentsDb = incidentsDb.map((incident) => {
    if (incident.id !== id) return incident
    return {
      ...incident,
      status,
      updatedAt: now(),
      timeline: [
        ...incident.timeline,
        createTimelineEvent(actor, `Estado actualizado`, note),
      ],
    }
  })
  return fetchIncidentById(id)
}

export function resetIncidentsMock() {
  incidentsDb = [...seedIncidents]
}
