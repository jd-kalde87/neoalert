import { useMemo } from 'react'
import { COUNTRY_GEO, MUNICIPALITY_GEO, WORLD_MAP_VIEW } from '@shared/constants/geo.constants'
import { useFilterStore } from '@shared/stores/filterStore'
import { useOperationsStore } from '@shared/stores/operationsStore'

export interface MapViewportTarget {
  center: [number, number]
  zoom: number
  label: string
}

export function useMapViewportTarget(): MapViewportTarget {
  const filters = useFilterStore((state) => state.filters)
  const projects = useOperationsStore((state) => state.projects)
  const departments = useOperationsStore((state) => state.departments)

  return useMemo(() => {
    if (filters.departmentId) {
      const department = departments.find((item) => item.id === filters.departmentId)
      if (department) {
        return {
          center: [department.latitude, department.longitude],
          zoom: 13,
          label: department.name,
        }
      }
    }

    if (filters.municipalityId) {
      const municipality = MUNICIPALITY_GEO.find((item) => item.value === filters.municipalityId)
      if (municipality) {
        return {
          center: [municipality.latitude, municipality.longitude],
          zoom: 12,
          label: municipality.label,
        }
      }
    }

    if (filters.projectId) {
      const project = projects.find((item) => item.id === filters.projectId)
      if (project) {
        return {
          center: [project.latitude, project.longitude],
          zoom: 10,
          label: project.name,
        }
      }
    }

    if (filters.countryCode) {
      const country = COUNTRY_GEO[filters.countryCode]
      if (country) {
        return {
          center: country.center,
          zoom: country.zoom,
          label: country.label,
        }
      }
    }

    return {
      center: WORLD_MAP_VIEW.center,
      zoom: WORLD_MAP_VIEW.zoom,
      label: 'Vista global',
    }
  }, [
    filters.countryCode,
    filters.departmentId,
    filters.municipalityId,
    filters.projectId,
    projects,
    departments,
  ])
}
