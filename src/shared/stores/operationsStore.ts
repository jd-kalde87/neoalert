import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SEED_PLANTS,
  SEED_ROUTES,
  SEED_WORK_SITES,
} from '@shared/constants/operations'
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
  createPlant: (payload: UpsertPlantPayload) => Plant
  updatePlant: (id: string, payload: UpsertPlantPayload) => Plant
  deletePlant: (id: string) => void
  createWorkSite: (payload: UpsertWorkSitePayload) => WorkSite
  updateWorkSite: (id: string, payload: UpsertWorkSitePayload) => WorkSite
  deleteWorkSite: (id: string) => void
  createRoute: (payload: UpsertRoutePayload) => OperationalRoute
  updateRoute: (id: string, payload: UpsertRoutePayload) => OperationalRoute
  deleteRoute: (id: string) => void
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

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set, get) => ({
      plants: SEED_PLANTS,
      workSites: SEED_WORK_SITES,
      routes: SEED_ROUTES,

      getPrimaryPlant: () => {
        const { plants } = get()
        return plants.find((item) => item.isPrimary && item.active) ?? plants.find((item) => item.active)
      },

      getActivePlants: () => get().plants.filter((item) => item.active),
      getActiveWorkSites: () => get().workSites.filter((item) => item.active),
      getActiveRoutes: () => get().routes.filter((item) => item.active),

      createPlant: (payload) => {
        const plant: Plant = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          description: payload.description?.trim(),
          address: payload.address?.trim(),
          latitude: payload.latitude,
          longitude: payload.longitude,
          isPrimary: payload.isPrimary ?? false,
          active: payload.active ?? true,
          updatedAt: now(),
        }

        set((state) => ({
          plants:
            plant.isPrimary
              ? [...state.plants.map((item) => ({ ...item, isPrimary: false })), plant]
              : [...state.plants, plant],
        }))

        return plant
      },

      updatePlant: (id, payload) => {
        let updated!: Plant
        set((state) => {
          const plants = state.plants.map((item) => {
            if (item.id !== id) {
              return payload.isPrimary ? { ...item, isPrimary: false } : item
            }
            updated = {
              ...item,
              name: payload.name.trim(),
              description: payload.description?.trim(),
              address: payload.address?.trim(),
              latitude: payload.latitude,
              longitude: payload.longitude,
              isPrimary: payload.isPrimary ?? item.isPrimary,
              active: payload.active ?? item.active,
              updatedAt: now(),
            }
            return updated
          })

          const routes = syncRoutesForEndpoints(state.routes, id, undefined, plants, state.workSites)

          return { plants, routes }
        })
        return updated
      },

      deletePlant: (id) => {
        const { routes } = get()
        if (routes.some((route) => route.plantId === id)) {
          throw new Error('No se puede eliminar: hay rutas asociadas a esta planta.')
        }
        set((state) => ({
          plants: state.plants.filter((item) => item.id !== id),
        }))
      },

      createWorkSite: (payload) => {
        const site: WorkSite = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          zoneId: payload.zoneId,
          description: payload.description?.trim(),
          latitude: payload.latitude,
          longitude: payload.longitude,
          active: payload.active ?? true,
          updatedAt: now(),
        }
        set((state) => ({ workSites: [...state.workSites, site] }))
        return site
      },

      updateWorkSite: (id, payload) => {
        let updated!: WorkSite
        set((state) => {
          const workSites = state.workSites.map((item) => {
            if (item.id !== id) return item
            updated = {
              ...item,
              name: payload.name.trim(),
              zoneId: payload.zoneId,
              description: payload.description?.trim(),
              latitude: payload.latitude,
              longitude: payload.longitude,
              active: payload.active ?? item.active,
              updatedAt: now(),
            }
            return updated
          })

          const routes = syncRoutesForEndpoints(state.routes, undefined, id, state.plants, workSites)

          return { workSites, routes }
        })
        return updated
      },

      deleteWorkSite: (id) => {
        const { routes } = get()
        if (routes.some((route) => route.workSiteId === id)) {
          throw new Error('No se puede eliminar: hay rutas asociadas a este punto de trabajo.')
        }
        set((state) => ({
          workSites: state.workSites.filter((item) => item.id !== id),
        }))
      },

      createRoute: (payload) => {
        const { plants, workSites } = get()
        const plant = plants.find((item) => item.id === payload.plantId)
        const site = workSites.find((item) => item.id === payload.workSiteId)
        if (!plant || !site) throw new Error('Planta o punto de trabajo no encontrado')

        const route: OperationalRoute = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          plantId: payload.plantId,
          workSiteId: payload.workSiteId,
          color: payload.color,
          coordinates:
            payload.coordinates && payload.coordinates.length >= 2
              ? payload.coordinates
              : buildRouteCoordinates(plant, site),
          estimatedMinutes: payload.estimatedMinutes,
          active: payload.active ?? true,
          roadSnapped: payload.roadSnapped ?? false,
          updatedAt: now(),
        }

        set((state) => ({ routes: [...state.routes, route] }))
        return route
      },

      updateRoute: (id, payload) => {
        let updated!: OperationalRoute
        set((state) => {
          const plant = state.plants.find((item) => item.id === payload.plantId)
          const site = state.workSites.find((item) => item.id === payload.workSiteId)
          if (!plant || !site) throw new Error('Planta o punto de trabajo no encontrado')

          const routes = state.routes.map((item) => {
            if (item.id !== id) return item
            updated = {
              ...item,
              name: payload.name.trim(),
              plantId: payload.plantId,
              workSiteId: payload.workSiteId,
              color: payload.color,
              coordinates:
                payload.coordinates && payload.coordinates.length >= 2
                  ? payload.coordinates
                  : buildRouteCoordinates(plant, site),
              estimatedMinutes: payload.estimatedMinutes,
              active: payload.active ?? item.active,
              roadSnapped: payload.roadSnapped ?? item.roadSnapped ?? false,
              updatedAt: now(),
            }
            return updated
          })

          return { routes }
        })
        return updated
      },

      deleteRoute: (id) => {
        set((state) => ({
          routes: state.routes.filter((item) => item.id !== id),
        }))
      },
    }),
    { name: 'neoalert-operations' },
  ),
)
