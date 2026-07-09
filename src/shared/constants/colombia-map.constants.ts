export type ColombiaThematicOverlay = 'none' | 'department-risk' | 'armed-groups'

export const COLOMBIA_RISK_GEOJSON_URL = '/maps/colombia/niveles-riesgo-2026.geojson'
export const COLOMBIA_ARMED_GROUPS_GEOJSON_URL = '/maps/colombia/grupos-armados.geojson'
export const COLOMBIA_ARMED_GROUPS_OVERLAY_URL = '/maps/colombia/grupos-armados-overlay.png'

/** Alineado al contorno nacional (mismo aspecto 756×1024 ≈ bbox Colombia). */
export const COLOMBIA_ARMED_GROUPS_OVERLAY_BOUNDS: [[number, number], [number, number]] = [
  [-4.3, -79.9],
  [13.6, -66.7],
]

export const COLOMBIA_ARMED_GROUPS_OVERLAY_OPACITY = 0.42

export const COLOMBIA_PROJECTS_AREAS_URL = '/maps/colombia/proyectos-wsp-2026-areas.geojson'
export const COLOMBIA_PROJECTS_MUNICIPIOS_URL = '/maps/colombia/proyectos-wsp-2026-municipios.geojson'
export const COLOMBIA_PROJECTS_CENTERS_URL = '/maps/colombia/proyectos-wsp-2026-centros.json'

export const COLOMBIA_PROJECTS_LAYER = {
  label: 'Proyectos WSP',
  shortLabel: 'Proyectos',
  description: 'Áreas de influencia y municipios asociados a proyectos WSP 2026.',
  source: 'Municipios_Proyectos_2026 (shapefile)',
} as const

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
      'Municipios coloreados por criticidad (Bajo → Extremo) con transparencia para ver el mapa base.',
    source: 'Niveles_de_riesgo_Colombia_2026 (APS-SIG / DANE)',
  },
  'armed-groups': {
    id: 'armed-groups',
    label: 'Presencia de grupos armados',
    shortLabel: 'G.A.O.',
    description:
      'Cartografía de presencia territorial de G.A.O. superpuesta al mapa base (colores atenuados).',
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
  { color: '#002060', label: 'Frente 57' },
  { color: '#000000', label: 'Autodefensas Sierra Nevada' },
  { color: '#548235', label: 'Clan del Golfo' },
  { color: '#C00000', label: 'ELN' },
  { color: '#FF66FF', label: 'Segunda Marquetalia' },
  { color: '#3399FF', label: 'Estado Mayor Central' },
  { color: '#FFC000', label: 'Est. Mayor Bloques y Frentes' },
  { color: '#9933CC', label: 'Coord. Ejército Bolivariano' },
  { color: '#FF6600', label: 'Frente Comuneros del Sur' },
] as const
