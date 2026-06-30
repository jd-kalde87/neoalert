export type MapLayerMode = 'standard' | 'satellite' | 'operational' | 'heatmap'

export type MapIncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

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

export interface MapIncidentsSummary {
  total: number
  bySeverity: Record<MapIncidentSeverity, number>
  byZone: { zoneId: string; zoneLabel: string; count: number }[]
  blockingRoutes: number
}
