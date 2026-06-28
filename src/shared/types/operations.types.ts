export interface Plant {
  id: string
  name: string
  description?: string
  address?: string
  latitude: number
  longitude: number
  isPrimary: boolean
  active: boolean
  updatedAt: string
}

export interface WorkSite {
  id: string
  name: string
  zoneId: string
  description?: string
  latitude: number
  longitude: number
  active: boolean
  updatedAt: string
}

export type RouteCoordinate = [number, number]

export interface OperationalRoute {
  id: string
  name: string
  plantId: string
  workSiteId: string
  color: string
  coordinates: RouteCoordinate[]
  estimatedMinutes?: number
  active: boolean
  /** Ruta calculada sobre red vial (OSRM); no se sobrescribe al mover planta/sitio automáticamente */
  roadSnapped?: boolean
  updatedAt: string
}

export interface UpsertPlantPayload {
  name: string
  description?: string
  address?: string
  latitude: number
  longitude: number
  isPrimary?: boolean
  active?: boolean
}

export interface UpsertWorkSitePayload {
  name: string
  zoneId: string
  description?: string
  latitude: number
  longitude: number
  active?: boolean
}

export interface UpsertRoutePayload {
  name: string
  plantId: string
  workSiteId: string
  color: string
  coordinates?: RouteCoordinate[]
  estimatedMinutes?: number
  active?: boolean
  roadSnapped?: boolean
}

export const ROUTE_COLOR_PRESETS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
] as const
