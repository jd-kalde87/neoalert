import { create } from 'zustand'
import {
  SEED_PLANTS,
  SEED_ROUTES,
  SEED_WORK_SITES,
} from '@shared/constants/operations'
import { USE_MOCK_API } from '@shared/config/api.config'
import {
  deletePlant as deletePlantApi,
  deleteRoute as deleteRouteApi,
  deleteWorkSite as deleteWorkSiteApi,
  fetchPlants,
  fetchRoutes,
  fetchWorkSites,
  upsertPlant as upsertPlantApi,
  upsertRoute as upsertRouteApi,
  upsertWorkSite as upsertWorkSiteApi,
} from '@features/operations/services/operations.api'
import type {
  OperationalRoute,
  Plant,
  RouteCoordinate,
  UpsertPlantPayload,
  UpsertRoutePayload,
  UpsertWorkSitePayload,
  WorkSite,
} from '@shared/types/operations.types'

function now() {
  return new Date().toISOString()
}

export function buildRouteCoordinates(
  plant: Pick<Plant, 'latitude' | 'longitude'>,
  site: Pick<WorkSite, 'latitude' | 'longitude'>,
): RouteCoordinate[] {
  const midLat = (plant.latitude + site.latitude) / 2
  const midLng = (plant.longitude + site.longitude) / 2
  return [
    [plant.latitude, plant.longitude],
    [midLat, midLng],
    [site.latitude, site.longitude],
  ]
}

interface OperationsState {
  plants: Plant[]
  workSites: WorkSite[]
  routes: OperationalRoute[]
  isLoading: boolean
  isError: boolean
  error: string | null
  hasLoaded: boolean
  fetchOperations: (options?: { force?: boolean }) => Promise<void>
  createPlant: (payload: UpsertPlantPayload) => Promise<Plant>
  updatePlant: (id: string, payload: UpsertPlantPayload) => Promise<Plant>
  deletePlant: (id: string) => Promise<void>
  createWorkSite: (payload: UpsertWorkSitePayload) => Promise<WorkSite>
  updateWorkSite: (id: string, payload: UpsertWorkSitePayload) => Promise<WorkSite>
  deleteWorkSite: (id: string) => Promise<void>
  createRoute: (payload: UpsertRoutePayload) => Promise<OperationalRoute>
  updateRoute: (id: string, payload: UpsertRoutePayload) => Promise<OperationalRoute>
  deleteRoute: (id: string) => Promise<void>
  getPrimaryPlant: () => Plant | undefined
  getActivePlants: () => Plant[]
  getActiveWorkSites: () => WorkSite[]
  getActiveRoutes: () => OperationalRoute[]
}

function syncRoutesForEndpoints(
  routes: OperationalRoute[],
  plantId: string | undefined,
  workSiteId: string | undefined,
  plants: Plant[],
  workSites: WorkSite[],
) {
  return routes.map((route) => {
    const matchesPlant = Boolean(plantId && route.plantId === plantId)
    const matchesSite = Boolean(workSiteId && route.workSiteId === workSiteId)
    if (!matchesPlant && !matchesSite) return route

    const plant = plants.find((item) => item.id === route.plantId)
    const site = workSites.find((item) => item.id === route.workSiteId)
    if (!plant || !site) return route

    return {
      ...route,
      coordinates: route.roadSnapped ? route.coordinates : buildRouteCoordinates(plant, site),
      updatedAt: now(),
    }
  })
}

function resolvePrimaryPlantId(plants: Plant[]) {
  return (
    plants.find((item) => item.isPrimary && item.active)?.id ??
    plants.find((item) => item.active)?.id
  )
}

function resolveRouteZoneId(workSites: WorkSite[], workSiteId: string) {
  const site = workSites.find((item) => item.id === workSiteId)
  if (!site) throw new Error('Punto de trabajo no encontrado')
  return site.zoneId
}

const initialData = USE_MOCK_API
  ? {
      plants: SEED_PLANTS,
      workSites: SEED_WORK_SITES,
      routes: SEED_ROUTES,
      hasLoaded: true,
    }
  : {
      plants: [] as Plant[],
      workSites: [] as WorkSite[],
      routes: [] as OperationalRoute[],
      hasLoaded: false,
    }

export const useOperationsStore = create<OperationsState>()((set, get) => ({
  ...initialData,
  isLoading: false,
  isError: false,
  error: null,

  fetchOperations: async (options) => {
    const { isLoading, hasLoaded } = get()
    if (isLoading) return
    if (hasLoaded && !options?.force) return

    set({ isLoading: true, isError: false, error: null })

    try {
      const [plants, workSites, routes] = await Promise.all([
        fetchPlants(),
        fetchWorkSites(),
        fetchRoutes(),
      ])
      set({
        plants,
        workSites,
        routes,
        isLoading: false,
        isError: false,
        error: null,
        hasLoaded: true,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo cargar la información operativa'
      set({ isLoading: false, isError: true, error: message })
      throw error
    }
  },

  getPrimaryPlant: () => {
    const { plants } = get()
    return plants.find((item) => item.isPrimary && item.active) ?? plants.find((item) => item.active)
  },

  getActivePlants: () => get().plants.filter((item) => item.active),
  getActiveWorkSites: () => get().workSites.filter((item) => item.active),
  getActiveRoutes: () => get().routes.filter((item) => item.active),

  createPlant: async (payload) => {
    const saved = await upsertPlantApi(payload)
    set((state) => ({
      plants:
        saved.isPrimary
          ? [...state.plants.map((item) => ({ ...item, isPrimary: false })), saved]
          : [...state.plants, saved],
    }))
    return saved
  },

  updatePlant: async (id, payload) => {
    const existing = get().plants.find((item) => item.id === id)
    if (!existing) throw new Error('Planta no encontrada')

    const saved = await upsertPlantApi(payload, id, existing)

    set((state) => {
      const plants = state.plants.map((item) => {
        if (item.id !== id) {
          return saved.isPrimary ? { ...item, isPrimary: false } : item
        }
        return saved
      })

      const routes = syncRoutesForEndpoints(state.routes, id, undefined, plants, state.workSites)
      return { plants, routes }
    })

    return saved
  },

  deletePlant: async (id) => {
    const { routes } = get()
    if (routes.some((route) => route.plantId === id)) {
      throw new Error('No se puede eliminar: hay rutas asociadas a esta planta.')
    }

    await deletePlantApi(id)
    set((state) => ({
      plants: state.plants.filter((item) => item.id !== id),
    }))
  },

  createWorkSite: async (payload) => {
    const plantId = resolvePrimaryPlantId(get().plants)
    if (!plantId) throw new Error('Registre al menos una planta activa antes de crear un punto.')

    const saved = await upsertWorkSiteApi(payload, plantId)
    set((state) => ({ workSites: [...state.workSites, saved] }))
    return saved
  },

  updateWorkSite: async (id, payload) => {
    const plantId = resolvePrimaryPlantId(get().plants)
    if (!plantId) throw new Error('No hay una planta activa asociada.')

    const saved = await upsertWorkSiteApi(payload, plantId, id)

    set((state) => {
      const workSites = state.workSites.map((item) => (item.id === id ? saved : item))
      const routes = syncRoutesForEndpoints(state.routes, undefined, id, state.plants, workSites)
      return { workSites, routes }
    })

    return saved
  },

  deleteWorkSite: async (id) => {
    const { routes } = get()
    if (routes.some((route) => route.workSiteId === id)) {
      throw new Error('No se puede eliminar: hay rutas asociadas a este punto de trabajo.')
    }

    await deleteWorkSiteApi(id)
    set((state) => ({
      workSites: state.workSites.filter((item) => item.id !== id),
    }))
  },

  createRoute: async (payload) => {
    const { plants, workSites } = get()
    const plant = plants.find((item) => item.id === payload.plantId)
    const site = workSites.find((item) => item.id === payload.workSiteId)
    if (!plant || !site) throw new Error('Planta o punto de trabajo no encontrado')

    const zoneId = resolveRouteZoneId(workSites, payload.workSiteId)
    const coordinates =
      payload.coordinates && payload.coordinates.length >= 2
        ? payload.coordinates
        : buildRouteCoordinates(plant, site)

    const saved = await upsertRouteApi({ ...payload, coordinates }, zoneId)
    set((state) => ({ routes: [...state.routes, saved] }))
    return saved
  },

  updateRoute: async (id, payload) => {
    const { plants, workSites } = get()
    const plant = plants.find((item) => item.id === payload.plantId)
    const site = workSites.find((item) => item.id === payload.workSiteId)
    if (!plant || !site) throw new Error('Planta o punto de trabajo no encontrado')

    const zoneId = resolveRouteZoneId(workSites, payload.workSiteId)
    const coordinates =
      payload.coordinates && payload.coordinates.length >= 2
        ? payload.coordinates
        : buildRouteCoordinates(plant, site)

    const saved = await upsertRouteApi({ ...payload, coordinates }, zoneId, id)
    set((state) => ({
      routes: state.routes.map((item) => (item.id === id ? saved : item)),
    }))
    return saved
  },

  deleteRoute: async (id) => {
    await deleteRouteApi(id)
    set((state) => ({
      routes: state.routes.filter((item) => item.id !== id),
    }))
  },
}))
