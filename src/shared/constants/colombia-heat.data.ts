import type { HeatmapPoint } from '@shared/types/map.types'

interface ColombiaHeatSeed extends HeatmapPoint {
  label: string
}

function toHeatmapPoints(seeds: ColombiaHeatSeed[]): HeatmapPoint[] {
  return seeds.map(({ latitude, longitude, severity }) => ({
    latitude,
    longitude,
    severity,
  }))
}

/** Centroides departamentales con nivel de riesgo territorial (2026) */
const DEPARTMENT_RISK_SEEDS: ColombiaHeatSeed[] = [
  { label: 'Amazonas', latitude: -1.44, longitude: -71.57, severity: 'high' },
  { label: 'Antioquia', latitude: 7.12, longitude: -75.45, severity: 'medium' },
  { label: 'Arauca', latitude: 7.08, longitude: -70.76, severity: 'critical' },
  { label: 'Atlántico', latitude: 10.7, longitude: -74.86, severity: 'low' },
  { label: 'Bolívar', latitude: 8.67, longitude: -74.12, severity: 'high' },
  { label: 'Boyacá', latitude: 5.53, longitude: -73.36, severity: 'low' },
  { label: 'Caldas', latitude: 5.07, longitude: -75.52, severity: 'low' },
  { label: 'Caquetá', latitude: 1.61, longitude: -75.61, severity: 'high' },
  { label: 'Casanare', latitude: 5.76, longitude: -71.57, severity: 'medium' },
  { label: 'Cauca', latitude: 2.44, longitude: -76.61, severity: 'critical' },
  { label: 'Cesar', latitude: 9.34, longitude: -73.65, severity: 'medium' },
  { label: 'Chocó', latitude: 5.69, longitude: -76.66, severity: 'critical' },
  { label: 'Córdoba', latitude: 8.75, longitude: -75.88, severity: 'medium' },
  { label: 'Cundinamarca', latitude: 4.71, longitude: -74.07, severity: 'low' },
  { label: 'Guainía', latitude: 3.87, longitude: -67.92, severity: 'high' },
  { label: 'Guaviare', latitude: 2.57, longitude: -72.64, severity: 'critical' },
  { label: 'Huila', latitude: 2.93, longitude: -75.28, severity: 'low' },
  { label: 'La Guajira', latitude: 11.54, longitude: -72.91, severity: 'high' },
  { label: 'Magdalena', latitude: 10.41, longitude: -74.41, severity: 'medium' },
  { label: 'Meta', latitude: 3.27, longitude: -73.09, severity: 'high' },
  { label: 'Nariño', latitude: 1.21, longitude: -77.28, severity: 'critical' },
  { label: 'Norte de Santander', latitude: 7.95, longitude: -72.91, severity: 'critical' },
  { label: 'Putumayo', latitude: 0.44, longitude: -76.52, severity: 'critical' },
  { label: 'Quindío', latitude: 4.46, longitude: -75.67, severity: 'low' },
  { label: 'Risaralda', latitude: 4.81, longitude: -75.7, severity: 'low' },
  { label: 'Santander', latitude: 6.64, longitude: -73.12, severity: 'low' },
  { label: 'Sucre', latitude: 9.3, longitude: -75.4, severity: 'medium' },
  { label: 'Tolima', latitude: 4.09, longitude: -75.15, severity: 'low' },
  { label: 'Valle del Cauca', latitude: 3.8, longitude: -76.64, severity: 'medium' },
  { label: 'Vaupés', latitude: 0.86, longitude: -70.81, severity: 'low' },
  { label: 'Vichada', latitude: 4.42, longitude: -69.29, severity: 'high' },
  // Zonas de riesgo extremo adicionales (municipios de alta conflictividad)
  { label: 'Tumaco', latitude: 1.8, longitude: -78.76, severity: 'critical' },
  { label: 'Buenaventura', latitude: 3.88, longitude: -77.03, severity: 'critical' },
  { label: 'Catatumbo', latitude: 8.25, longitude: -72.95, severity: 'critical' },
  { label: 'Puerto Asís', latitude: 0.51, longitude: -76.5, severity: 'critical' },
  { label: 'San José del Guaviare', latitude: 2.57, longitude: -72.64, severity: 'critical' },
]

/** Puntos de presencia de grupos armados organizados */
const ARMED_GROUPS_SEEDS: ColombiaHeatSeed[] = [
  // Clan del Golfo — noroccidente y costa
  { label: 'Clan del Golfo — Urabá', latitude: 7.88, longitude: -76.63, severity: 'critical' },
  { label: 'Clan del Golfo — Córdoba', latitude: 8.75, longitude: -75.88, severity: 'high' },
  { label: 'Clan del Golfo — Chocó', latitude: 6.25, longitude: -77.4, severity: 'high' },
  { label: 'Clan del Golfo — Sucre', latitude: 9.3, longitude: -75.1, severity: 'high' },
  { label: 'Clan del Golfo — Bolívar', latitude: 10.25, longitude: -75.2, severity: 'medium' },
  { label: 'Clan del Golfo — Magdalena', latitude: 10.6, longitude: -74.4, severity: 'medium' },
  // ELN — frontera y pacífico
  { label: 'ELN — Arauca', latitude: 7.08, longitude: -70.76, severity: 'critical' },
  { label: 'ELN — Catatumbo', latitude: 8.25, longitude: -72.95, severity: 'critical' },
  { label: 'ELN — Chocó', latitude: 5.69, longitude: -76.66, severity: 'high' },
  { label: 'ELN — Cauca', latitude: 2.44, longitude: -76.61, severity: 'high' },
  { label: 'ELN — Nariño', latitude: 1.21, longitude: -77.28, severity: 'critical' },
  { label: 'ELN — Vichada', latitude: 4.42, longitude: -69.29, severity: 'medium' },
  // Estado Mayor Central — sur y oriente
  { label: 'EMC — Caquetá', latitude: 1.61, longitude: -75.61, severity: 'critical' },
  { label: 'EMC — Guaviare', latitude: 2.57, longitude: -72.64, severity: 'critical' },
  { label: 'EMC — Meta', latitude: 3.27, longitude: -73.09, severity: 'high' },
  { label: 'EMC — Putumayo', latitude: 0.44, longitude: -76.52, severity: 'critical' },
  { label: 'EMC — Cauca', latitude: 2.1, longitude: -77.0, severity: 'high' },
  // Segunda Marquetalia — frontera con Venezuela
  { label: 'Segunda Marquetalia — Vichada', latitude: 4.8, longitude: -69.0, severity: 'high' },
  { label: 'Segunda Marquetalia — Guainía', latitude: 3.87, longitude: -67.92, severity: 'high' },
  // Estado Mayor de Bloques y Frentes
  { label: 'EMBF — Meta', latitude: 3.8, longitude: -73.5, severity: 'high' },
  { label: 'EMBF — Huila', latitude: 2.5, longitude: -75.5, severity: 'medium' },
  // Coordinadora Ejército Bolivariano — suroccidente
  { label: 'CNEB — Nariño', latitude: 1.5, longitude: -78.0, severity: 'critical' },
  { label: 'CNEB — Putumayo', latitude: 0.8, longitude: -77.0, severity: 'high' },
  // Frente Comuneros del Sur
  { label: 'FCS — Nariño', latitude: 1.0, longitude: -77.8, severity: 'high' },
  // Autodefensas Sierra Nevada
  { label: 'ACSN — Magdalena', latitude: 11.2, longitude: -74.0, severity: 'medium' },
  { label: 'ACSN — La Guajira', latitude: 11.54, longitude: -72.91, severity: 'medium' },
  // Frente 57
  { label: 'Frente 57 — Chocó', latitude: 5.0, longitude: -76.8, severity: 'medium' },
]

export const COLOMBIA_DEPARTMENT_RISK_POINTS = toHeatmapPoints(DEPARTMENT_RISK_SEEDS)
export const COLOMBIA_ARMED_GROUPS_POINTS = toHeatmapPoints(ARMED_GROUPS_SEEDS)

export const COLOMBIA_HEAT_GRADIENTS = {
  'department-risk': {
    0.2: '#22c55e',
    0.45: '#eab308',
    0.65: '#f97316',
    0.85: '#ea580c',
    1: '#dc2626',
  },
  'armed-groups': {
    0.25: '#fbbf24',
    0.5: '#f97316',
    0.7: '#dc2626',
    0.85: '#991b1b',
    1: '#450a0a',
  },
  risks: {
    0.2: '#3b82f6',
    0.45: '#22c55e',
    0.65: '#eab308',
    0.85: '#f97316',
    1: '#dc2626',
  },
} as const satisfies Record<string, Record<number, string>>

export const COLOMBIA_HEAT_CONFIG = {
  'department-risk': { radius: 42, blur: 28, maxZoom: 10 },
  'armed-groups': { radius: 38, blur: 26, maxZoom: 11 },
  risks: { radius: 28, blur: 22, maxZoom: 16 },
} as const

export function getColombiaHeatPoints(
  overlay: 'none' | 'department-risk' | 'armed-groups',
): HeatmapPoint[] {
  if (overlay === 'armed-groups') return COLOMBIA_ARMED_GROUPS_POINTS
  return []
}
