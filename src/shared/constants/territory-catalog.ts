import {
  DEPARTMENT_PRIMARY_PROJECT,
  PROJECT_DEPARTMENT_KEYS,
  TERRITORY_DEPARTMENTS,
  TERRITORY_MUNICIPALITIES,
  TERRITORY_PROJECTS,
  type TerritoryDepartment,
  type TerritoryMunicipality,
  type TerritoryProject,
} from './territory-catalog.generated'

export {
  DEPARTMENT_PRIMARY_PROJECT,
  PROJECT_DEPARTMENT_KEYS,
  TERRITORY_DEPARTMENTS,
  TERRITORY_MUNICIPALITIES,
  TERRITORY_PROJECTS,
  type TerritoryDepartment,
  type TerritoryMunicipality,
  type TerritoryProject,
}

export function getTerritoryDepartmentById(id?: string): TerritoryDepartment | undefined {
  return TERRITORY_DEPARTMENTS.find((item) => item.id === id)
}

export function getTerritoryMunicipalityById(id?: string): TerritoryMunicipality | undefined {
  return TERRITORY_MUNICIPALITIES.find((item) => item.id === id)
}

export function getTerritoryProjectById(id?: string): TerritoryProject | undefined {
  return TERRITORY_PROJECTS.find((item) => item.id === id)
}

export function getTerritoryProjectOptions(countryCode?: string) {
  return TERRITORY_PROJECTS.filter((item) => !countryCode || item.countryCode === countryCode).map(
    (item) => ({ value: item.id, label: item.label }),
  )
}

export function getTerritoryDepartmentOptions(filters?: {
  countryCode?: string
  projectId?: string
  municipalityId?: string
}) {
  let departments = TERRITORY_DEPARTMENTS

  if (filters?.countryCode) {
    departments = departments.filter((item) => item.countryCode === filters.countryCode)
  }

  if (filters?.projectId) {
    const keys = PROJECT_DEPARTMENT_KEYS[filters.projectId] ?? []
    departments = departments.filter((item) => keys.includes(item.departmentKey))
  }

  if (filters?.municipalityId) {
    const municipality = getTerritoryMunicipalityById(filters.municipalityId)
    if (municipality) {
      departments = departments.filter((item) => item.departmentKey === municipality.departmentKey)
    }
  }

  return departments.map((item) => ({ value: item.id, label: item.label }))
}

export function getTerritoryMunicipalityOptions(filters?: {
  countryCode?: string
  departmentId?: string
  projectId?: string
}) {
  let municipalities = TERRITORY_MUNICIPALITIES

  if (filters?.countryCode) {
    municipalities = municipalities.filter((item) => item.countryCode === filters.countryCode)
  }

  if (filters?.departmentId) {
    const department = getTerritoryDepartmentById(filters.departmentId)
    if (department) {
      municipalities = municipalities.filter(
        (item) => item.departmentKey === department.departmentKey,
      )
    }
  }

  if (filters?.projectId) {
    const keys = PROJECT_DEPARTMENT_KEYS[filters.projectId] ?? []
    municipalities = municipalities.filter((item) => keys.includes(item.departmentKey))
  }

  return municipalities.map((item) => ({ value: item.id, label: item.label }))
}
