export type MapLayerMode = 'standard' | 'satellite' | 'operational' | 'heatmap'

export type { ColombiaThematicOverlay } from '@shared/constants/colombia-map.constants'

export type MapPointSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface MapRisk {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  severity: MapPointSeverity
  status: string
  municipalityId: string
  municipalityLabel: string
  departmentId?: string
  riskType?: string
  reportedAt?: string
}

export interface MapRisksSummary {
  total: number
  bySeverity: Record<MapPointSeverity, number>
  byMunicipality: { municipalityId: string; municipalityLabel: string; count: number }[]
}

/** @deprecated Incidentes materializados — usar MapRisk para el mapa principal */
export type MapIncidentSeverity = MapPointSeverity

/** @deprecated */
export interface MapIncident {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  severity: MapIncidentSeverity
  status: string
  zoneId: string
  zoneLabel: string
  siteId?: string
  incidentType?: string
  blocksTransit?: boolean
  routeName?: string
  reportedAt?: string
}

/** @deprecated */
export interface MapIncidentsSummary {
  total: number
  bySeverity: Record<MapIncidentSeverity, number>
  byZone: { zoneId: string; zoneLabel: string; count: number }[]
  blockingRoutes: number
}

export interface HeatmapPoint {
  latitude: number
  longitude: number
  severity: MapPointSeverity
}
