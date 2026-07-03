export interface Project {
  id: string
  name: string
  description?: string
  address?: string
  countryCode: string
  latitude: number
  longitude: number
  isPrimary: boolean
  active: boolean
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  municipalityId: string
  projectId: string
  countryCode: string
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
  projectId: string
  departmentId: string
  color: string
  coordinates: RouteCoordinate[]
  estimatedMinutes?: number
  active: boolean
  roadSnapped?: boolean
  updatedAt: string
}

export interface UpsertProjectPayload {
  name: string
  description?: string
  address?: string
  countryCode: string
  latitude: number
  longitude: number
  isPrimary?: boolean
  active?: boolean
}

export interface UpsertDepartmentPayload {
  name: string
  municipalityId: string
  projectId: string
  countryCode: string
  description?: string
  latitude: number
  longitude: number
  active?: boolean
}

export interface UpsertRoutePayload {
  name: string
  projectId: string
  departmentId: string
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

/** @deprecated Use Project */
export type Plant = Project
/** @deprecated Use Department */
export type WorkSite = Department
/** @deprecated Use UpsertProjectPayload */
export type UpsertPlantPayload = UpsertProjectPayload
/** @deprecated Use UpsertDepartmentPayload */
export type UpsertWorkSitePayload = UpsertDepartmentPayload
