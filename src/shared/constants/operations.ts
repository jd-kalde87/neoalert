import type { Department, OperationalRoute, Project } from '@shared/types/operations.types'

export const SEED_PROJECTS: Project[] = [
  {
    id: 'project-ipiales',
    name: 'Proyecto Ipiales',
    description: 'Operación de monitoreo en corredor Nariño',
    countryCode: 'CO',
    latitude: 0.828,
    longitude: -77.642,
    isPrimary: true,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'project-cali',
    name: 'Proyecto Cali',
    description: 'Operación en Valle del Cauca',
    countryCode: 'CO',
    latitude: 3.4516,
    longitude: -76.532,
    isPrimary: false,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'project-manizales',
    name: 'Proyecto Manizales',
    description: 'Operación en Caldas',
    countryCode: 'CO',
    latitude: 5.0689,
    longitude: -75.5174,
    isPrimary: false,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'project-medellin',
    name: 'Proyecto Medellín',
    description: 'Operación en Antioquia',
    countryCode: 'CO',
    latitude: 6.2442,
    longitude: -75.5812,
    isPrimary: false,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
]

export const SEED_DEPARTMENTS: Department[] = [
  {
    id: 'dept-narino',
    name: 'Nariño',
    latitude: 0.828,
    longitude: -77.642,
    municipalityId: 'muni-ipiales',
    projectId: 'project-ipiales',
    countryCode: 'CO',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'dept-valle',
    name: 'Valle del Cauca',
    latitude: 3.4516,
    longitude: -76.532,
    municipalityId: 'muni-cali',
    projectId: 'project-cali',
    countryCode: 'CO',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'dept-caldas',
    name: 'Caldas',
    latitude: 5.0689,
    longitude: -75.5174,
    municipalityId: 'muni-manizales',
    projectId: 'project-manizales',
    countryCode: 'CO',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'dept-antioquia',
    name: 'Antioquia',
    latitude: 6.2442,
    longitude: -75.5812,
    municipalityId: 'muni-medellin',
    projectId: 'project-medellin',
    countryCode: 'CO',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
]

export const SEED_ROUTES: OperationalRoute[] = [
  {
    id: 'route-ipiales',
    name: 'Proyecto Ipiales → Nariño',
    projectId: 'project-ipiales',
    departmentId: 'dept-narino',
    color: '#2563eb',
    coordinates: [
      [0.828, -77.642],
      [0.83, -77.63],
      [0.835, -77.62],
    ],
    estimatedMinutes: 35,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'route-cali',
    name: 'Proyecto Cali → Valle del Cauca',
    projectId: 'project-cali',
    departmentId: 'dept-valle',
    color: '#059669',
    coordinates: [
      [3.4516, -76.532],
      [3.46, -76.52],
      [3.47, -76.51],
    ],
    estimatedMinutes: 40,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
]

export const SEED_PLANTS = SEED_PROJECTS
export const SEED_WORK_SITES = SEED_DEPARTMENTS
export const PROJECT_CENTRAL = SEED_PROJECTS[0]!
export const PLANT_CENTRAL = PROJECT_CENTRAL
export const DEPARTMENTS = SEED_DEPARTMENTS
export const WORK_SITES = SEED_DEPARTMENTS
export const OPERATIONAL_ROUTES = SEED_ROUTES
