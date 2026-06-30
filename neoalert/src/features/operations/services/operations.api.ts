import { USE_MOCK_API } from '@shared/config/api.config'
import {
  SEED_PLANTS,
  SEED_ROUTES,
  SEED_WORK_SITES,
} from '@shared/constants/operations'
import { API_ENDPOINTS, authorizedRequest } from '@shared/services/api'
import type {
  OperationalRoute,
  Plant,
  RouteCoordinate,
  UpsertPlantPayload,
  UpsertRoutePayload,
  UpsertWorkSitePayload,
  WorkSite,
} from '@shared/types/operations.types'

type ApiCoordinate = { lat: number; lng: number }

interface ApiPlant {
  id: string
  name: string
  code?: string
  latitude: number
  longitude: number
  address?: string
  description?: string
  isPrimary?: boolean
  active: boolean
  updatedAt?: string
}

interface ApiWorkSite {
  id: string
  name: string
  plantId?: string
  zoneId: string
  description?: string
  latitude: number
  longitude: number
  active: boolean
  updatedAt?: string
}

interface ApiRoute {
  id: string
  name: string
  plantId: string
  workSiteId: string
  zoneId?: string
  color: string
  coordinates: Array<ApiCoordinate | RouteCoordinate>
  estimatedMinutes?: number
  roadSnapped?: boolean
  active: boolean
  updatedAt?: string
}

function now() {
  return new Date().toISOString()
}

function slugCode(name: string) {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base.slice(0, 12) || 'PLT'
}

function mapCoordinatesFromApi(
  coordinates: Array<ApiCoordinate | RouteCoordinate>,
): RouteCoordinate[] {
  return coordinates.map((point) => {
    if (Array.isArray(point)) return point
    return [point.lat, point.lng]
  })
}

function mapCoordinatesToApi(coordinates: RouteCoordinate[]): ApiCoordinate[] {
  return coordinates.map(([lat, lng]) => ({ lat, lng }))
}

function mapPlantFromApi(item: ApiPlant): Plant {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    isPrimary: item.isPrimary ?? false,
    active: item.active,
    updatedAt: item.updatedAt ?? now(),
  }
}

function mapWorkSiteFromApi(item: ApiWorkSite): WorkSite {
  return {
    id: item.id,
    name: item.name,
    zoneId: item.zoneId,
    description: item.description,
    latitude: item.latitude,
    longitude: item.longitude,
    active: item.active,
    updatedAt: item.updatedAt ?? now(),
  }
}

function mapRouteFromApi(item: ApiRoute): OperationalRoute {
  return {
    id: item.id,
    name: item.name,
    plantId: item.plantId,
    workSiteId: item.workSiteId,
    color: item.color,
    coordinates: mapCoordinatesFromApi(item.coordinates),
    estimatedMinutes: item.estimatedMinutes,
    active: item.active,
    roadSnapped: item.roadSnapped ?? false,
    updatedAt: item.updatedAt ?? now(),
  }
}

function mapPlantToApi(payload: UpsertPlantPayload, existing?: Plant) {
  return {
    name: payload.name.trim(),
    code: existing ? undefined : slugCode(payload.name),
    latitude: payload.latitude,
    longitude: payload.longitude,
    address: payload.address?.trim() ?? '',
    description: payload.description?.trim(),
    isPrimary: payload.isPrimary ?? false,
    active: payload.active ?? true,
  }
}

function mapWorkSiteToApi(
  payload: UpsertWorkSitePayload,
  plantId: string,
) {
  return {
    name: payload.name.trim(),
    plantId,
    zoneId: payload.zoneId,
    description: payload.description?.trim(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    active: payload.active ?? true,
  }
}

function mapRouteToApi(
  payload: UpsertRoutePayload,
  zoneId: string,
) {
  return {
    name: payload.name.trim(),
    plantId: payload.plantId,
    workSiteId: payload.workSiteId,
    zoneId,
    color: payload.color,
    coordinates: mapCoordinatesToApi(payload.coordinates ?? []),
    estimatedMinutes: payload.estimatedMinutes,
    roadSnapped: payload.roadSnapped ?? false,
    active: payload.active ?? true,
  }
}

export async function fetchPlants(): Promise<Plant[]> {
  if (USE_MOCK_API) return [...SEED_PLANTS]
  const data = await authorizedRequest<ApiPlant[]>(API_ENDPOINTS.operations.plants)
  return data.map(mapPlantFromApi)
}

export async function fetchWorkSites(): Promise<WorkSite[]> {
  if (USE_MOCK_API) return [...SEED_WORK_SITES]
  const data = await authorizedRequest<ApiWorkSite[]>(API_ENDPOINTS.operations.workSites)
  return data.map(mapWorkSiteFromApi)
}

export async function fetchRoutes(): Promise<OperationalRoute[]> {
  if (USE_MOCK_API) return [...SEED_ROUTES]
  const data = await authorizedRequest<ApiRoute[]>(API_ENDPOINTS.operations.routes)
  return data.map(mapRouteFromApi)
}

export async function upsertPlant(
  payload: UpsertPlantPayload,
  id?: string,
  existing?: Plant,
): Promise<Plant> {
  if (USE_MOCK_API) {
    const plant: Plant = {
      id: id ?? crypto.randomUUID(),
      name: payload.name.trim(),
      description: payload.description?.trim(),
      address: payload.address?.trim(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      isPrimary: payload.isPrimary ?? false,
      active: payload.active ?? true,
      updatedAt: now(),
    }
    return plant
  }

  const body = mapPlantToApi(payload, existing)
  if (id) {
    const data = await authorizedRequest<ApiPlant>(`${API_ENDPOINTS.operations.plants}/${id}`, {
      method: 'PUT',
      body,
    })
    return mapPlantFromApi(data)
  }

  const data = await authorizedRequest<ApiPlant>(API_ENDPOINTS.operations.plants, {
    method: 'POST',
    body,
  })
  return mapPlantFromApi(data)
}

export async function deletePlant(id: string): Promise<void> {
  if (USE_MOCK_API) return
  await authorizedRequest<void>(`${API_ENDPOINTS.operations.plants}/${id}`, {
    method: 'DELETE',
  })
}

export async function upsertWorkSite(
  payload: UpsertWorkSitePayload,
  plantId: string,
  id?: string,
): Promise<WorkSite> {
  if (USE_MOCK_API) {
    const site: WorkSite = {
      id: id ?? crypto.randomUUID(),
      name: payload.name.trim(),
      zoneId: payload.zoneId,
      description: payload.description?.trim(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      active: payload.active ?? true,
      updatedAt: now(),
    }
    return site
  }

  const body = mapWorkSiteToApi(payload, plantId)
  if (id) {
    const data = await authorizedRequest<ApiWorkSite>(`${API_ENDPOINTS.operations.workSites}/${id}`, {
      method: 'PUT',
      body,
    })
    return mapWorkSiteFromApi(data)
  }

  const data = await authorizedRequest<ApiWorkSite>(API_ENDPOINTS.operations.workSites, {
    method: 'POST',
    body,
  })
  return mapWorkSiteFromApi(data)
}

export async function deleteWorkSite(id: string): Promise<void> {
  if (USE_MOCK_API) return
  await authorizedRequest<void>(`${API_ENDPOINTS.operations.workSites}/${id}`, {
    method: 'DELETE',
  })
}

export async function upsertRoute(
  payload: UpsertRoutePayload,
  zoneId: string,
  id?: string,
): Promise<OperationalRoute> {
  if (USE_MOCK_API) {
    const route: OperationalRoute = {
      id: id ?? crypto.randomUUID(),
      name: payload.name.trim(),
      plantId: payload.plantId,
      workSiteId: payload.workSiteId,
      color: payload.color,
      coordinates: payload.coordinates ?? [],
      estimatedMinutes: payload.estimatedMinutes,
      active: payload.active ?? true,
      roadSnapped: payload.roadSnapped ?? false,
      updatedAt: now(),
    }
    return route
  }

  const body = mapRouteToApi(payload, zoneId)
  if (id) {
    const data = await authorizedRequest<ApiRoute>(`${API_ENDPOINTS.operations.routes}/${id}`, {
      method: 'PUT',
      body,
    })
    return mapRouteFromApi(data)
  }

  const data = await authorizedRequest<ApiRoute>(API_ENDPOINTS.operations.routes, {
    method: 'POST',
    body,
  })
  return mapRouteFromApi(data)
}

export async function deleteRoute(id: string): Promise<void> {
  if (USE_MOCK_API) return
  await authorizedRequest<void>(`${API_ENDPOINTS.operations.routes}/${id}`, {
    method: 'DELETE',
  })
}
