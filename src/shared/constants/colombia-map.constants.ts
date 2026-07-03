export type ColombiaThematicOverlay = 'none' | 'department-risk' | 'armed-groups'

export const COLOMBIA_RISK_GEOJSON_URL = '/maps/colombia/niveles-riesgo-2026.geojson'

export const CRITICIDAD_FILL_COLORS: Record<string, string> = {
  bajo: '#22c55e',
  medio: '#eab308',
  alto: '#f97316',
  extremo: '#dc2626',
  unknown: '#94a3b8',
}

export interface ColombiaThematicLayerConfig {
  id: ColombiaThematicOverlay
  label: string
  shortLabel: string
  description: string
  source: string
}

export const COLOMBIA_THEMATIC_LAYERS: Record<
  Exclude<ColombiaThematicOverlay, 'none'>,
  ColombiaThematicLayerConfig
> = {
  'department-risk': {
    id: 'department-risk',
    label: 'Nivel de riesgo departamental',
    shortLabel: 'Riesgo CO',
    description:
      'Polígonos municipales por nivel de criticidad (Bajo, Medio, Alto, Extremo) — fuente shapefile 2026.',
    source: 'Niveles_de_riesgo_Colombia_2026 (APS-SIG / DANE)',
  },
  'armed-groups': {
    id: 'armed-groups',
    label: 'Presencia de grupos armados',
    shortLabel: 'G.A.O.',
    description:
      'Concentración de presencia de grupos armados organizados (ELN, disidencias, Clan del Golfo, etc.).',
    source: 'Cartografía de grupos armados organizados — Colombia',
  },
}

export const DEPARTMENT_RISK_LEGEND = [
  { color: '#22c55e', label: 'Bajo' },
  { color: '#eab308', label: 'Medio' },
  { color: '#f97316', label: 'Alto' },
  { color: '#dc2626', label: 'Extremo' },
] as const

export const ARMED_GROUPS_LEGEND = [
  { color: '#1e3a8a', label: 'Frente 57' },
  { color: '#ec4899', label: 'Segunda Marquetalia' },
  { color: '#38bdf8', label: 'Estado Mayor Central' },
  { color: '#facc15', label: 'Est. Mayor Bloques y Frentes' },
  { color: '#a855f7', label: 'Coord. Ejército Bolivariano' },
  { color: '#fb923c', label: 'Frente Comuneros del Sur' },
  { color: '#991b1b', label: 'ELN' },
  { color: '#16a34a', label: 'Clan del Golfo' },
  { color: '#171717', label: 'Autodefensas Sierra Nevada' },
] as const
