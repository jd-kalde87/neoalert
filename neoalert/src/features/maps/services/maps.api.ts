import type { GlobalFilters } from '@shared/types/common.types'
import type { MapIncident, MapIncidentsSummary } from '@shared/types/map.types'
import { INCIDENT_STATUS_LABELS } from '@features/incidents/types/incident.types'
import { fetchIncidents } from '@features/incidents/services/incidents.api'
import { USE_MOCK_API } from '@shared/config/api.config'
import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import { toQueryParams } from '@shared/utils/query-params'

function toMapIncident(
  incident: Awaited<ReturnType<typeof fetchIncidents>>[number],
): MapIncident {
  return {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    latitude: incident.latitude,
    longitude: incident.longitude,
    severity: incident.severity,
    status: INCIDENT_STATUS_LABELS[incident.status],
    zoneId: incident.zoneId ?? 'unknown',
    zoneLabel: incident.zoneLabel ?? 'Sin corredor',
    siteId: incident.siteId,
    incidentType: incident.type,
    blocksTransit: incident.blocksTransit,
    routeName: incident.routeName,
    reportedAt: incident.reportedAt,
  }
}

function buildSummary(incidents: MapIncident[]): MapIncidentsSummary {
  const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 }
  const zoneMap = new Map<string, { zoneId: string; zoneLabel: string; count: number }>()
  let blockingRoutes = 0

  incidents.forEach((incident) => {
    bySeverity[incident.severity] += 1
    if (incident.blocksTransit) blockingRoutes += 1
    const current = zoneMap.get(incident.zoneId) ?? {
      zoneId: incident.zoneId,
      zoneLabel: incident.zoneLabel,
      count: 0,
    }
    current.count += 1
    zoneMap.set(incident.zoneId, current)
  })

  return {
    total: incidents.length,
    bySeverity,
    byZone: Array.from(zoneMap.values()),
    blockingRoutes,
  }
}

export async function fetchMapIncidents(filters: GlobalFilters) {
  if (!USE_MOCK_API) {
    try {
      const fromMaps = await authorizedRequest<{
        incidents: MapIncident[]
        summary: MapIncidentsSummary
      }>(API_ENDPOINTS.maps.incidents, {
        params: toQueryParams(filters),
      })
      if (fromMaps.incidents.length > 0) {
        return fromMaps
      }
    } catch {
      // Fallback to incident-service when maps aggregator is empty.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 150))
  const incidents = (await fetchIncidents(filters)).map(toMapIncident)
  return {
    incidents,
    summary: buildSummary(incidents),
  }
}
