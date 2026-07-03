import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { useMap } from 'react-leaflet'
import type { HeatmapPoint } from '@shared/types/map.types'

interface HeatmapLayerProps {
  points: HeatmapPoint[]
  visible: boolean
  radius?: number
  blur?: number
  maxZoom?: number
  gradient?: Record<number, string>
}

export function HeatmapLayer({
  points,
  visible,
  radius = 28,
  blur = 22,
  maxZoom = 16,
  gradient = {
    0.2: '#3b82f6',
    0.45: '#22c55e',
    0.65: '#eab308',
    0.85: '#f97316',
    1: '#dc2626',
  },
}: HeatmapLayerProps) {
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

    const heatPoints = points.map(
      (point) =>
        [
          point.latitude,
          point.longitude,
          intensityBySeverity[point.severity],
        ] as [number, number, number],
    )

    const layer = L.heatLayer(heatPoints, {
      radius,
      blur,
      maxZoom,
      gradient,
    })

    layer.addTo(map)
    layerRef.current = layer

    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [points, map, visible, radius, blur, maxZoom, gradient])

  return null
}
