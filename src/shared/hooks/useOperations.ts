import { useMemo } from 'react'
import { MUNICIPALITY_OPTIONS } from '@shared/constants/filter-options'
import {
  getTerritoryDepartmentOptions,
  getTerritoryMunicipalityOptions,
  getTerritoryProjectOptions,
} from '@shared/constants/territory-catalog'
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
  return useMemo(() => getTerritoryProjectOptions(countryCode), [countryCode])
}

export function useDepartmentSelectOptions(filters?: {
  countryCode?: string
  projectId?: string
  municipalityId?: string
}) {
  return useMemo(
    () => getTerritoryDepartmentOptions(filters),
    [filters?.countryCode, filters?.projectId, filters?.municipalityId],
  )
}

export function useMunicipalityOptions(
  countryCode?: string,
  filters?: { departmentId?: string; projectId?: string },
) {
  return useMemo(
    () =>
      getTerritoryMunicipalityOptions({
        countryCode,
        departmentId: filters?.departmentId,
        projectId: filters?.projectId,
      }),
    [countryCode, filters?.departmentId, filters?.projectId],
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
