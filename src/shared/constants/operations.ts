import type { Department, OperationalRoute, Project } from '@shared/types/operations.types'
import {
  TERRITORY_DEPARTMENTS,
  TERRITORY_MUNICIPALITIES,
  TERRITORY_PROJECTS,
  DEPARTMENT_PRIMARY_PROJECT,
} from './territory-catalog.generated'

const UPDATED_AT = '2026-07-08T22:00:00Z'

function municipalityForDepartment(departmentKey: string) {
  return TERRITORY_MUNICIPALITIES.find((item) => item.departmentKey === departmentKey)
}

export const SEED_PROJECTS: Project[] = TERRITORY_PROJECTS.map((project, index) => ({
  id: project.id,
  name: project.label,
  description: `Proyecto WSP ${project.noProyect}`,
  countryCode: project.countryCode,
  latitude: project.latitude,
  longitude: project.longitude,
  isPrimary: index === 0,
  active: true,
  updatedAt: UPDATED_AT,
}))

export const SEED_DEPARTMENTS: Department[] = TERRITORY_DEPARTMENTS.map((department) => {
  const municipality = municipalityForDepartment(department.departmentKey)
  return {
    id: department.id,
    name: department.label,
    municipalityId: municipality?.id ?? 'muni-bogota',
    projectId:
      DEPARTMENT_PRIMARY_PROJECT[department.departmentKey] ?? SEED_PROJECTS[0]?.id ?? 'project-1502',
    countryCode: department.countryCode,
    latitude: municipality?.latitude ?? 4.57,
    longitude: municipality?.longitude ?? -75.5,
    active: true,
    updatedAt: UPDATED_AT,
  }
})

export const SEED_ROUTES: OperationalRoute[] = [
  {
    id: 'route-24718452-antioquia',
    name: 'Verificación redes EPM → Antioquia',
    projectId: 'project-24718452',
    departmentId: 'dept-antioquia',
    color: '#2563eb',
    coordinates: [
      [6.2442, -75.5812],
      [6.5, -75.4],
      [7.0, -75.3],
    ],
    estimatedMinutes: 45,
    active: true,
    updatedAt: UPDATED_AT,
  },
  {
    id: 'route-1876-norte',
    name: 'Corredor soberanía → Norte de Santander',
    projectId: 'project-1876',
    departmentId: 'dept-norte-de-santander',
    color: '#ea580c',
    coordinates: [
      [7.08821, -72.25091],
      [7.5, -72.5],
      [7.95, -72.85],
    ],
    estimatedMinutes: 50,
    active: true,
    updatedAt: UPDATED_AT,
  },
]

export const SEED_PLANTS = SEED_PROJECTS
export const SEED_WORK_SITES = SEED_DEPARTMENTS
export const PROJECT_CENTRAL = SEED_PROJECTS[0]!
export const PLANT_CENTRAL = PROJECT_CENTRAL
export const DEPARTMENTS = SEED_DEPARTMENTS
export const WORK_SITES = SEED_DEPARTMENTS
export const OPERATIONAL_ROUTES = SEED_ROUTES
