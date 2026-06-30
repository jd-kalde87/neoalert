import { fetchIncidents } from '@features/incidents/services/incidents.api'
import type { Incident } from '@features/incidents/types/incident.types'
import type { RouteSafetyValidation } from '../types/attendance.types'

const ACTIVE_STATUSES: Incident['status'][] = ['open', 'in_review', 'in_progress']

function matchesRoute(incident: Incident, routeName: string, targetWorkSite?: string) {
  if (incident.routeName === routeName) return true
  if (targetWorkSite && incident.targetWorkSite === targetWorkSite) return true
  return false
}

export async function validateRouteSafety(
  routeName: string,
  targetWorkSite?: string,
): Promise<RouteSafetyValidation> {
  const incidents = await fetchIncidents({}, {})
  const active = incidents.filter((incident) => ACTIVE_STATUSES.includes(incident.status))

  const relevant = active.filter((incident) => matchesRoute(incident, routeName, targetWorkSite))

  const blockingIncidents = relevant
    .filter((incident) => incident.blocksTransit)
    .map((incident) => ({
      id: incident.id,
      code: incident.code,
      title: incident.title,
      routeName: incident.routeName,
    }))

  const warningIncidents = relevant
    .filter(
      (incident) =>
        !incident.blocksTransit &&
        (incident.severity === 'high' || incident.severity === 'critical'),
    )
    .map((incident) => ({
      id: incident.id,
      code: incident.code,
      title: incident.title,
      severity: incident.severity,
    }))

  if (blockingIncidents.length > 0) {
    return {
      allowed: false,
      level: 'blocked',
      message: `Ruta bloqueada: ${blockingIncidents.length} incidente(s) de seguridad impiden el desplazamiento.`,
      blockingIncidents,
      warningIncidents,
    }
  }

  if (warningIncidents.length > 0) {
    return {
      allowed: true,
      level: 'warning',
      message: `Precaución: ${warningIncidents.length} incidente(s) activo(s) en la ruta. Transitar con alerta.`,
      blockingIncidents: [],
      warningIncidents,
    }
  }

  return {
    allowed: true,
    level: 'clear',
    message: 'Ruta sin incidentes bloqueantes. Desplazamiento permitido.',
    blockingIncidents: [],
    warningIncidents: [],
  }
}
