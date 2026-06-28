import type { OperationalRoute, Plant, WorkSite } from '@shared/types/operations.types'

export const SEED_PLANTS: Plant[] = [
  {
    id: 'plant-main',
    name: 'Planta central',
    description: 'Punto de salida del personal hacia sitios de operación',
    latitude: 4.695,
    longitude: -74.13,
    isPrimary: true,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
]

export const SEED_WORK_SITES: WorkSite[] = [
  {
    id: 'site-alpha',
    name: 'Sitio Alpha — Campo Norte',
    latitude: 4.78,
    longitude: -74.02,
    zoneId: 'zone-norte',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'site-beta',
    name: 'Sitio Beta — Corredor Central',
    latitude: 4.64,
    longitude: -74.09,
    zoneId: 'zone-centro',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'site-gamma',
    name: 'Sitio Gamma — Sector Sur',
    latitude: 4.58,
    longitude: -74.15,
    zoneId: 'zone-sur',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'site-delta',
    name: 'Sitio Delta — Vía Oriental',
    latitude: 4.62,
    longitude: -73.98,
    zoneId: 'zone-oriente',
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
]

export const SEED_ROUTES: OperationalRoute[] = [
  {
    id: 'route-norte',
    name: 'Ruta Planta → Sitio Alpha',
    plantId: 'plant-main',
    workSiteId: 'site-alpha',
    color: '#2563eb',
    coordinates: [
      [4.695, -74.13],
      [4.72, -74.11],
      [4.75, -74.07],
      [4.78, -74.02],
    ],
    estimatedMinutes: 52,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'route-centro',
    name: 'Ruta Planta → Sitio Beta',
    plantId: 'plant-main',
    workSiteId: 'site-beta',
    color: '#059669',
    coordinates: [
      [4.695, -74.13],
      [4.68, -74.12],
      [4.64, -74.09],
    ],
    estimatedMinutes: 45,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'route-sur',
    name: 'Ruta Planta → Sitio Gamma',
    plantId: 'plant-main',
    workSiteId: 'site-gamma',
    color: '#d97706',
    coordinates: [
      [4.695, -74.13],
      [4.67, -74.14],
      [4.58, -74.15],
    ],
    estimatedMinutes: 58,
    active: true,
    updatedAt: '2026-06-01T10:00:00Z',
  },
]

/** @deprecated Use useOperationsStore — kept for type-only imports */
export const PLANT_CENTRAL = SEED_PLANTS[0]!
export const WORK_SITES = SEED_WORK_SITES
export const OPERATIONAL_ROUTES = SEED_ROUTES
