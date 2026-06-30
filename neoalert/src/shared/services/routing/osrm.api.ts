import type { RouteCoordinate } from '@shared/types/operations.types'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

export interface RoadRouteResult {
  coordinates: RouteCoordinate[]
  distanceMeters: number
  durationSeconds: number
}

function toOsrmCoord([lat, lng]: RouteCoordinate) {
  return `${lng},${lat}`
}

/** Trazado por red vial (OpenStreetMap vía OSRM). */
export async function fetchRoadRoute(waypoints: RouteCoordinate[]): Promise<RoadRouteResult> {
  if (waypoints.length < 2) {
    throw new Error('Se requieren al menos origen y destino.')
  }

  const path = waypoints.map(toOsrmCoord).join(';')
  const url = `${OSRM_BASE}/${path}?overview=full&geometries=geojson&steps=false`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('No se pudo calcular la ruta sobre la red vial.')
  }

  const data = (await response.json()) as {
    code: string
    routes?: {
      distance: number
      duration: number
      geometry: { coordinates: [number, number][] }
    }[]
    message?: string
  }

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(data.message ?? 'No hay ruta disponible entre los puntos seleccionados.')
  }

  const route = data.routes[0]
  const coordinates: RouteCoordinate[] = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

  return {
    coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }
}

export function secondsToEstimatedMinutes(seconds: number) {
  return Math.max(1, Math.round(seconds / 60))
}
