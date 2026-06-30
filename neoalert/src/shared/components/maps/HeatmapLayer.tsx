import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { useMap } from 'react-leaflet'
import type { MapIncident, MapIncidentSeverity } from '@shared/types/map.types'

interface HeatmapLayerProps {
  incidents: MapIncident[]
  visible: boolean
}

/** Intensidad por nivel de riesgo — alimenta el gradiente verde → rojo. */
const SEVERITY_INTENSITY: Record<MapIncidentSeverity, number> = {
  low: 0.35,
  medium: 0.55,
  high: 0.78,
  critical: 1,
}

/**
 * Un punto por incidente (todos visibles en el heatmap).
 * Varios incidentes en la misma zona suman intensidad naturalmente.
 */
function buildRiskHeatPoints(incidents: MapIncident[]): Array<[number, number, number]> {
  return incidents.map((incident) => [
    incident.latitude,
    incident.longitude,
    SEVERITY_INTENSITY[incident.severity],
  ])
}

/** Gradiente alineado a niveles de riesgo (referencia: verde bajo → rojo crítico). */
const RISK_HEAT_GRADIENT = {
  0.2: '#22c55e',
  0.4: '#84cc16',
  0.55: '#eab308',
  0.7: '#f97316',
  0.85: '#ef4444',
  1: '#b91c1c',
} as const

export function HeatmapLayer({ incidents, visible }: HeatmapLayerProps) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (!visible) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
      return
    }

    const points = buildRiskHeatPoints(incidents)
    if (points.length === 0) return

    const layer = L.heatLayer(points, {
      radius: 48,
      blur: 42,
      maxZoom: 14,
      minOpacity: 0.45,
      max: 1,
      gradient: RISK_HEAT_GRADIENT,
    })

    layer.addTo(map)
    layerRef.current = layer

    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [incidents, map, visible])

  return null
}
