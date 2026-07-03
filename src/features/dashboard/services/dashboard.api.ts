import { matchesTerritoryFilters } from '@shared/utils/territoryFilters'
import type { GlobalFilters } from '@shared/types/common.types'
import type { DashboardSummary } from '../types/dashboard.types'

const BASE_KPIS: DashboardSummary['kpis'] = [
  {
    id: 'active-risks',
    label: 'Zonas de riesgo activas',
    value: 5,
    hint: 'Territorio monitoreado',
    trend: { direction: 'up', label: '+2 hoy' },
    variant: 'warning',
  },
  {
    id: 'blocked-routes',
    label: 'Rutas bloqueadas',
    value: 2,
    hint: 'No transitar — personal en planta',
    trend: { direction: 'up', label: 'Revisar corredor norte' },
    variant: 'danger',
  },
  {
    id: 'high-risk-zones',
    label: 'Puntos riesgo alto/crítico',
    value: 3,
    hint: 'Mapa y app móvil',
    trend: { direction: 'neutral', label: 'Monitoreo activo' },
    variant: 'warning',
  },
  {
    id: 'field-personnel',
    label: 'Personal en sitios',
    value: 142,
    hint: 'Desde planta central',
    trend: { direction: 'down', label: '-8 por bloqueos' },
  },
  {
    id: 'verified-incidents',
    label: 'En verificación',
    value: 2,
    hint: 'Jefe de área / admin',
    trend: { direction: 'neutral', label: 'Pendiente cierre' },
  },
  {
    id: 'mitigated-today',
    label: 'Riesgos mitigados hoy',
    value: 1,
    hint: 'Rutas reabiertas',
    trend: { direction: 'up', label: '+1 vs ayer' },
    variant: 'success',
  },
]

const BASE_ALERTS: DashboardSummary['alerts'] = [
  {
    id: 'alert-1',
    title: 'Bloqueo total — Ruta Sitio Alpha',
    message: 'Manifestación cierra calzada. Personal debe permanecer en planta central.',
    type: 'incident',
    severity: 'critical',
    timestamp: '2026-06-28T09:12:00Z',
    read: false,
    zoneId: 'zone-norte',
    siteId: 'site-alpha',
  },
  {
    id: 'alert-2',
    title: 'Grupo armado en vía alterna',
    message: 'Corredor hacia Sitio Beta — convoyes suspendidos hasta verificación.',
    type: 'incident',
    severity: 'critical',
    timestamp: '2026-06-28T08:45:00Z',
    read: false,
    zoneId: 'zone-centro',
    siteId: 'site-beta',
  },
  {
    id: 'alert-3',
    title: 'Altercado en cruce sur',
    message: 'Desvío habilitado hacia Sitio Gamma con escolta.',
    type: 'incident',
    severity: 'high',
    timestamp: '2026-06-28T08:10:00Z',
    read: true,
    zoneId: 'zone-sur',
    siteId: 'site-gamma',
  },
  {
    id: 'alert-4',
    title: 'Retén no autorizado — corredor oriental',
    message: 'Acceso a Sitio Delta solo con autorización de seguridad.',
    type: 'incident',
    severity: 'medium',
    timestamp: '2026-06-28T07:55:00Z',
    read: false,
    zoneId: 'zone-oriente',
    siteId: 'site-delta',
  },
]

function applyFilterMultiplier(filters: GlobalFilters) {
  let multiplier = 1
  if (filters.municipalityId) multiplier *= 0.72
  if (filters.departmentId) multiplier *= 0.85
  if (filters.sectorId) multiplier *= 0.6
  if (filters.eventType) multiplier *= 0.9
  return multiplier
}

function filterAlerts(filters: GlobalFilters) {
  return BASE_ALERTS.filter((alert) => {
    if (!matchesTerritoryFilters(alert, filters)) return false
    if (filters.eventType && alert.type !== filters.eventType) return false
    return true
  })
}

function scaleKpis(filters: GlobalFilters): DashboardSummary['kpis'] {
  const multiplier = applyFilterMultiplier(filters)

  return BASE_KPIS.map((kpi) => {
    if (typeof kpi.value === 'number') {
      const scaled = Math.max(0, Math.round(kpi.value * multiplier))
      return { ...kpi, value: scaled }
    }

    if (kpi.id === 'attendance-rate') {
      const base = 92
      const adjusted = Math.max(75, Math.min(99, Math.round(base - (1 - multiplier) * 20)))
      return { ...kpi, value: `${adjusted}%` }
    }

    return kpi
  })
}

export async function fetchDashboardSummary(filters: GlobalFilters): Promise<DashboardSummary> {
  await new Promise((resolve) => setTimeout(resolve, 450))

  const alerts = filterAlerts(filters)
  const kpis = scaleKpis(filters)

  return {
    kpis,
    alerts,
    mapSummary: {
      activeRisks: Number(kpis.find((k) => k.id === 'active-risks')?.value ?? 0),
      municipalitiesMonitored: filters.municipalityId ? 1 : 4,
      sectorsOnField: Number(kpis.find((k) => k.id === 'field-personnel')?.value ?? 0),
    },
  }
}
