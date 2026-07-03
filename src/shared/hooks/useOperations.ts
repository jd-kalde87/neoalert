import { useMemo } from 'react'
import { MUNICIPALITY_OPTIONS } from '@shared/constants/filter-options'
import { MUNICIPALITY_GEO } from '@shared/constants/geo.constants'
import { useOperationsStore } from '@shared/stores/operationsStore'

export function useProjects() {
  return useOperationsStore((state) => state.projects)
}

export function useDepartments() {
  return useOperationsStore((state) => state.departments)
}

export function useOperationalRoutes() {
  return useOperationsStore((state) => state.routes)
}

export function usePrimaryProject() {
  const projects = useOperationsStore((state) => state.projects)
  return useMemo(
    () =>
      projects.find((item) => item.isPrimary && item.active) ??
      projects.find((item) => item.active),
    [projects],
  )
}

export function useActiveOperationalData() {
  const projects = useOperationsStore((state) => state.projects)
  const departments = useOperationsStore((state) => state.departments)
  const routes = useOperationsStore((state) => state.routes)

  return useMemo(
    () => ({
      projects: projects.filter((item) => item.active),
      departments: departments.filter((item) => item.active),
      routes: routes.filter((item) => item.active),
    }),
    [projects, departments, routes],
  )
}

export function useRouteNameOptions() {
  const routes = useOperationsStore((state) => state.routes)
  return useMemo(
    () =>
      routes
        .filter((route) => route.active)
        .map((route) => ({ value: route.name, label: route.name })),
    [routes],
  )
}

export function useDepartmentLabelOptions() {
  const departments = useOperationsStore((state) => state.departments)
  return useMemo(
    () =>
      departments
        .filter((department) => department.active)
        .map((department) => ({
          value: department.name,
          label: department.name,
          id: department.id,
        })),
    [departments],
  )
}

export function useDepartmentByName(name: string | undefined) {
  const departments = useOperationsStore((state) => state.departments)
  return useMemo(
    () => departments.find((department) => department.name === name),
    [departments, name],
  )
}

export function municipalityLabel(municipalityId: string) {
  return (
    MUNICIPALITY_OPTIONS.find((item) => item.value === municipalityId)?.label ?? municipalityId
  )
}

export function useProjectOptions(countryCode?: string) {
  const projects = useOperationsStore((state) => state.projects)
  return useMemo(
    () =>
      projects
        .filter((project) => project.active)
        .filter((project) => !countryCode || project.countryCode === countryCode)
        .map((project) => ({ value: project.id, label: project.name })),
    [projects, countryCode],
  )
}

export function useDepartmentSelectOptions(filters?: {
  countryCode?: string
  projectId?: string
  municipalityId?: string
}) {
  const departments = useOperationsStore((state) => state.departments)
  return useMemo(
    () =>
      departments
        .filter((department) => department.active)
        .filter(
          (department) => !filters?.countryCode || department.countryCode === filters.countryCode,
        )
        .filter((department) => !filters?.projectId || department.projectId === filters.projectId)
        .filter(
          (department) =>
            !filters?.municipalityId || department.municipalityId === filters.municipalityId,
        )
        .map((department) => ({ value: department.id, label: department.name })),
    [departments, filters?.countryCode, filters?.projectId, filters?.municipalityId],
  )
}

export function useMunicipalityOptions(countryCode?: string) {
  return useMemo(
    () =>
      MUNICIPALITY_GEO.filter((item) => !countryCode || item.countryCode === countryCode).map(
        (item) => ({ value: item.value, label: item.label }),
      ),
    [countryCode],
  )
}

/** @deprecated Use useProjects */
export const usePlants = useProjects
/** @deprecated Use useDepartments */
export const useWorkSites = useDepartments
/** @deprecated Use usePrimaryProject */
export const usePrimaryPlant = usePrimaryProject
/** @deprecated Use useProjectOptions */
export const usePlantOptions = useProjectOptions
/** @deprecated Use useDepartmentSelectOptions */
export const useWorkSiteSelectOptions = useDepartmentSelectOptions
/** @deprecated Use useDepartmentLabelOptions */
export const useWorkSiteLabelOptions = useDepartmentLabelOptions
/** @deprecated Use useDepartmentByName */
export const useWorkSiteByName = useDepartmentByName
/** @deprecated Use municipalityLabel */
export const zoneLabel = municipalityLabel
