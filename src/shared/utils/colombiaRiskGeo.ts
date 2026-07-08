import type { HeatmapPoint, MapPointSeverity } from '@shared/types/map.types'

type GeoPosition = [number, number]

export interface ColombiaRiskFeatureProperties {
  nombre: string
  departamento: string
  codDane: string
  criticidad: string
  criticidadLabel: string
}

export interface ColombiaRiskGeoFeature {
  type: 'Feature'
  properties: ColombiaRiskFeatureProperties
  geometry: GeoJSON.Geometry
}

export interface ColombiaRiskGeoCollection {
  type: 'FeatureCollection'
  features: ColombiaRiskGeoFeature[]
}

const CRITICIDAD_TO_SEVERITY: Record<string, MapPointSeverity> = {
  bajo: 'low',
  medio: 'medium',
  alto: 'high',
  extremo: 'critical',
}

function ringCentroid(ring: GeoPosition[]): { latitude: number; longitude: number } | null {
  if (ring.length === 0) return null

  let sumLat = 0
  let sumLng = 0
  for (const [lng, lat] of ring) {
    sumLat += lat
    sumLng += lng
  }

  return {
    latitude: sumLat / ring.length,
    longitude: sumLng / ring.length,
  }
}

export function geometryCentroid(
  geometry: GeoJSON.Geometry,
): { latitude: number; longitude: number } | null {
  if (geometry.type === 'Polygon') {
    return ringCentroid(geometry.coordinates[0] as GeoPosition[])
  }

  if (geometry.type === 'MultiPolygon') {
    let largestRing = geometry.coordinates[0]?.[0] as GeoPosition[] | undefined
    for (const polygon of geometry.coordinates) {
      const ring = polygon[0] as GeoPosition[]
      if (!largestRing || ring.length > largestRing.length) {
        largestRing = ring
      }
    }
    return largestRing ? ringCentroid(largestRing) : null
  }

  return null
}

export function geoJsonToRiskHeatPoints(collection: ColombiaRiskGeoCollection): HeatmapPoint[] {
  const points: HeatmapPoint[] = []

  for (const feature of collection.features) {
    const centroid = geometryCentroid(feature.geometry)
    if (!centroid) continue

    const criticidad = feature.properties?.criticidad ?? 'unknown'
    const severity = CRITICIDAD_TO_SEVERITY[criticidad] ?? 'medium'

    points.push({
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      severity,
    })
  }

  return points
}
