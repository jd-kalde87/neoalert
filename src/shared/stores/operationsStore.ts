import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  SEED_DEPARTMENTS,
  SEED_PROJECTS,
  SEED_ROUTES,
} from '@shared/constants/operations'
import type {
  Department,
  OperationalRoute,
  Project,
  RouteCoordinate,
  UpsertDepartmentPayload,
  UpsertProjectPayload,
  UpsertRoutePayload,
} from '@shared/types/operations.types'

function now() {
  return new Date().toISOString()
}

export function buildRouteCoordinates(
  project: Pick<Project, 'latitude' | 'longitude'>,
  department: Pick<Department, 'latitude' | 'longitude'>,
): RouteCoordinate[] {
  const midLat = (project.latitude + department.latitude) / 2
  const midLng = (project.longitude + department.longitude) / 2
  return [
    [project.latitude, project.longitude],
    [midLat, midLng],
    [department.latitude, department.longitude],
  ]
}

interface OperationsState {
  projects: Project[]
  departments: Department[]
  routes: OperationalRoute[]
  createProject: (payload: UpsertProjectPayload) => Project
  updateProject: (id: string, payload: UpsertProjectPayload) => Project
  deleteProject: (id: string) => void
  createDepartment: (payload: UpsertDepartmentPayload) => Department
  updateDepartment: (id: string, payload: UpsertDepartmentPayload) => Department
  deleteDepartment: (id: string) => void
  createRoute: (payload: UpsertRoutePayload) => OperationalRoute
  updateRoute: (id: string, payload: UpsertRoutePayload) => OperationalRoute
  deleteRoute: (id: string) => void
  getPrimaryProject: () => Project | undefined
  getActiveProjects: () => Project[]
  getActiveDepartments: () => Department[]
  getActiveRoutes: () => OperationalRoute[]
}

function syncRoutesForEndpoints(
  routes: OperationalRoute[],
  projectId: string | undefined,
  departmentId: string | undefined,
  projects: Project[],
  departments: Department[],
) {
  return routes.map((route) => {
    const matchesProject = Boolean(projectId && route.projectId === projectId)
    const matchesDepartment = Boolean(departmentId && route.departmentId === departmentId)
    if (!matchesProject && !matchesDepartment) return route

    const project = projects.find((item) => item.id === route.projectId)
    const department = departments.find((item) => item.id === route.departmentId)
    if (!project || !department) return route

    return {
      ...route,
      coordinates: route.roadSnapped ? route.coordinates : buildRouteCoordinates(project, department),
      updatedAt: now(),
    }
  })
}

function migrateLegacyProject(raw: Record<string, unknown>): Project {
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: raw.description ? String(raw.description) : undefined,
    address: raw.address ? String(raw.address) : undefined,
    countryCode: String(raw.countryCode ?? 'CO'),
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    isPrimary: Boolean(raw.isPrimary),
    active: raw.active !== false,
    updatedAt: String(raw.updatedAt ?? now()),
  }
}

function migrateLegacyDepartment(raw: Record<string, unknown>): Department {
  return {
    id: String(raw.id),
    name: String(raw.name),
    municipalityId: String(raw.municipalityId ?? raw.zoneId ?? 'muni-bogota'),
    projectId: String(raw.projectId ?? raw.plantId ?? 'project-main'),
    countryCode: String(raw.countryCode ?? 'CO'),
    description: raw.description ? String(raw.description) : undefined,
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    active: raw.active !== false,
    updatedAt: String(raw.updatedAt ?? now()),
  }
}

function migrateLegacyRoute(raw: Record<string, unknown>): OperationalRoute {
  return {
    id: String(raw.id),
    name: String(raw.name),
    projectId: String(raw.projectId ?? raw.plantId),
    departmentId: String(raw.departmentId ?? raw.workSiteId),
    color: String(raw.color),
    coordinates: raw.coordinates as RouteCoordinate[],
    estimatedMinutes: raw.estimatedMinutes ? Number(raw.estimatedMinutes) : undefined,
    active: raw.active !== false,
    roadSnapped: Boolean(raw.roadSnapped),
    updatedAt: String(raw.updatedAt ?? now()),
  }
}

type PersistedOperations = {
  projects?: Project[]
  departments?: Department[]
  routes?: OperationalRoute[]
  plants?: Project[]
  workSites?: Department[]
}

function migratePersistedState(persisted: PersistedOperations): Pick<
  OperationsState,
  'projects' | 'departments' | 'routes'
> {
  const projects = (persisted.projects ?? persisted.plants ?? SEED_PROJECTS).map((item) =>
    migrateLegacyProject(item as unknown as Record<string, unknown>),
  )
  const departments = (persisted.departments ?? persisted.workSites ?? SEED_DEPARTMENTS).map(
    (item) => migrateLegacyDepartment(item as unknown as Record<string, unknown>),
  )
  const routes = (persisted.routes ?? SEED_ROUTES).map((item) =>
    migrateLegacyRoute(item as unknown as Record<string, unknown>),
  )
  return { projects, departments, routes }
}

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,
      departments: SEED_DEPARTMENTS,
      routes: SEED_ROUTES,

      getPrimaryProject: () => {
        const { projects } = get()
        return (
          projects.find((item) => item.isPrimary && item.active) ??
          projects.find((item) => item.active)
        )
      },

      getActiveProjects: () => get().projects.filter((item) => item.active),
      getActiveDepartments: () => get().departments.filter((item) => item.active),
      getActiveRoutes: () => get().routes.filter((item) => item.active),

      createProject: (payload) => {
        const project: Project = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          description: payload.description?.trim(),
          address: payload.address?.trim(),
          countryCode: payload.countryCode,
          latitude: payload.latitude,
          longitude: payload.longitude,
          isPrimary: payload.isPrimary ?? false,
          active: payload.active ?? true,
          updatedAt: now(),
        }

        set((state) => ({
          projects: project.isPrimary
            ? [...state.projects.map((item) => ({ ...item, isPrimary: false })), project]
            : [...state.projects, project],
        }))

        return project
      },

      updateProject: (id, payload) => {
        let updated!: Project
        set((state) => {
          const projects = state.projects.map((item) => {
            if (item.id !== id) {
              return payload.isPrimary ? { ...item, isPrimary: false } : item
            }
            updated = {
              ...item,
              name: payload.name.trim(),
              description: payload.description?.trim(),
              address: payload.address?.trim(),
              countryCode: payload.countryCode,
              latitude: payload.latitude,
              longitude: payload.longitude,
              isPrimary: payload.isPrimary ?? item.isPrimary,
              active: payload.active ?? item.active,
              updatedAt: now(),
            }
            return updated
          })

          const routes = syncRoutesForEndpoints(
            state.routes,
            id,
            undefined,
            projects,
            state.departments,
          )

          return { projects, routes }
        })
        return updated
      },

      deleteProject: (id) => {
        const { routes } = get()
        if (routes.some((route) => route.projectId === id)) {
          throw new Error('No se puede eliminar: hay rutas asociadas a este proyecto.')
        }
        set((state) => ({
          projects: state.projects.filter((item) => item.id !== id),
        }))
      },

      createDepartment: (payload) => {
        const department: Department = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          municipalityId: payload.municipalityId,
          projectId: payload.projectId,
          countryCode: payload.countryCode,
          description: payload.description?.trim(),
          latitude: payload.latitude,
          longitude: payload.longitude,
          active: payload.active ?? true,
          updatedAt: now(),
        }
        set((state) => ({ departments: [...state.departments, department] }))
        return department
      },

      updateDepartment: (id, payload) => {
        let updated!: Department
        set((state) => {
          const departments = state.departments.map((item) => {
            if (item.id !== id) return item
            updated = {
              ...item,
              name: payload.name.trim(),
              municipalityId: payload.municipalityId,
              projectId: payload.projectId,
              countryCode: payload.countryCode,
              description: payload.description?.trim(),
              latitude: payload.latitude,
              longitude: payload.longitude,
              active: payload.active ?? item.active,
              updatedAt: now(),
            }
            return updated
          })

          const routes = syncRoutesForEndpoints(
            state.routes,
            undefined,
            id,
            state.projects,
            departments,
          )

          return { departments, routes }
        })
        return updated
      },

      deleteDepartment: (id) => {
        const { routes } = get()
        if (routes.some((route) => route.departmentId === id)) {
          throw new Error('No se puede eliminar: hay rutas asociadas a este departamento.')
        }
        set((state) => ({
          departments: state.departments.filter((item) => item.id !== id),
        }))
      },

      createRoute: (payload) => {
        const { projects, departments } = get()
        const project = projects.find((item) => item.id === payload.projectId)
        const department = departments.find((item) => item.id === payload.departmentId)
        if (!project || !department) throw new Error('Proyecto o departamento no encontrado')

        const route: OperationalRoute = {
          id: crypto.randomUUID(),
          name: payload.name.trim(),
          projectId: payload.projectId,
          departmentId: payload.departmentId,
          color: payload.color,
          coordinates:
            payload.coordinates && payload.coordinates.length >= 2
              ? payload.coordinates
              : buildRouteCoordinates(project, department),
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
          const project = state.projects.find((item) => item.id === payload.projectId)
          const department = state.departments.find((item) => item.id === payload.departmentId)
          if (!project || !department) throw new Error('Proyecto o departamento no encontrado')

          const routes = state.routes.map((item) => {
            if (item.id !== id) return item
            updated = {
              ...item,
              name: payload.name.trim(),
              projectId: payload.projectId,
              departmentId: payload.departmentId,
              color: payload.color,
              coordinates:
                payload.coordinates && payload.coordinates.length >= 2
                  ? payload.coordinates
                  : buildRouteCoordinates(project, department),
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
    {
      name: 'neoalert-operations',
      version: 4,
      migrate: (persisted, version) => {
        if (version < 4) {
          return {
            projects: SEED_PROJECTS,
            departments: SEED_DEPARTMENTS,
            routes: SEED_ROUTES,
          }
        }
        if (version < 3) {
          return {
            projects: SEED_PROJECTS,
            departments: SEED_DEPARTMENTS,
            routes: SEED_ROUTES,
          }
        }
        if (version < 2) {
          return migratePersistedState(persisted as PersistedOperations)
        }
        return persisted as Pick<OperationsState, 'projects' | 'departments' | 'routes'>
      },
    },
  ),
)
