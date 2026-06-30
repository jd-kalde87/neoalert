import type { Incident, IncidentSeverity } from '@features/incidents/types/incident.types'
import type { DashboardSummary } from '../types/dashboard.types'

const ACTIVE_STATUSES = new Set(['open', 'in_review', 'in_progress'])

function severityRank(severity: IncidentSeverity): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[severity]
}

export function buildDashboardFromIncidents(incidents: Incident[]): DashboardSummary {
  const active = incidents.filter((item) => ACTIVE_STATUSES.has(item.status))
  const blocked = active.filter((item) => item.blocksTransit)
  const highRisk = active.filter(
    (item) => item.severity === 'high' || item.severity === 'critical',
  )
  const inReview = incidents.filter((item) => item.status === 'in_review')
  const resolvedToday = incidents.filter((item) => item.status === 'resolved')

  const zones = new Set(
    incidents.map((item) => item.zoneId).filter((zoneId): zoneId is string => Boolean(zoneId)),
  )

  const alerts = [...active]
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 6)
    .map((incident) => ({
      id: `alert-${incident.id}`,
      title: incident.title,
      message: incident.blocksTransit
        ? `${incident.routeName ?? incident.location} — bloqueo de tránsito`
        : `${incident.location} — precaución en ruta`,
      type: 'incident' as const,
      severity: incident.severity,
      timestamp: incident.reportedAt,
      read: incident.status !== 'open',
      zoneId: incident.zoneId,
      siteId: incident.siteId,
    }))

  return {
    kpis: [
      {
        id: 'active-incidents',
        label: 'Incidentes activos',
        value: active.length,
        hint: 'En rutas operativas',
        trend: { direction: 'neutral', label: 'Datos importados y en vivo' },
        variant: active.length > 0 ? 'warning' : 'default',
      },
      {
        id: 'blocked-routes',
        label: 'Rutas bloqueadas',
        value: blocked.length,
        hint: 'Sin tránsito seguro',
        trend: { direction: blocked.length > 0 ? 'up' : 'neutral', label: 'Revisar corredores' },
        variant: blocked.length > 0 ? 'danger' : 'default',
      },
      {
        id: 'high-risk-zones',
        label: 'Riesgo alto/crítico',
        value: highRisk.length,
        hint: 'Mapa y calor',
        trend: { direction: 'neutral', label: 'Monitoreo activo' },
        variant: highRisk.length > 0 ? 'warning' : 'default',
      },
      {
        id: 'field-personnel',
        label: 'Registros en mapa',
        value: incidents.length,
        hint: 'Total georreferenciado',
        trend: { direction: 'up', label: 'Incluye importaciones' },
      },
      {
        id: 'verified-incidents',
        label: 'En verificación',
        value: inReview.length,
        hint: 'Pendiente de cierre',
        trend: { direction: 'neutral', label: 'Seguimiento operativo' },
      },
      {
        id: 'mitigated-today',
        label: 'Mitigados',
        value: resolvedToday.length,
        hint: 'Riesgos cerrados',
        trend: { direction: 'up', label: 'Histórico' },
        variant: resolvedToday.length > 0 ? 'success' : 'default',
      },
    ],
    alerts,
    mapSummary: {
      activeIncidents: active.length,
      zonesMonitored: zones.size || 1,
      crewsOnField: incidents.length,
    },
  }
}
