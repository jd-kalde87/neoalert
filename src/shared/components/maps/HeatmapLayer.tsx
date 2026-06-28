import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { useMap } from 'react-leaflet'
import type { MapIncident } from '@shared/types/map.types'

interface HeatmapLayerProps {
  incidents: MapIncident[]
  visible: boolean
}

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

    const intensityBySeverity = {
      low: 0.35,
      medium: 0.55,
      high: 0.75,
      critical: 1,
    } as const

    const points = incidents.map(
      (incident) =>
        [
          incident.latitude,
          incident.longitude,
          intensityBySeverity[incident.severity],
        ] as [number, number, number],
    )

    const layer = L.heatLayer(points, {
      radius: 28,
      blur: 22,
      maxZoom: 16,
      gradient: {
        0.2: '#3b82f6',
        0.45: '#22c55e',
        0.65: '#eab308',
        0.85: '#f97316',
        1: '#dc2626',
      },
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
