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
  minOpacity?: number
  intensityScale?: number
  gradient?: Record<number, string>
}

const DEFAULT_INTENSITY_BY_SEVERITY = {
  low: 0.35,
  medium: 0.55,
  high: 0.75,
  critical: 1,
} as const

export function HeatmapLayer({
  points,
  visible,
  radius = 28,
  blur = 22,
  maxZoom = 16,
  minOpacity = 0.12,
  intensityScale = 1,
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

    const heatPoints = points.map(
      (point) =>
        [
          point.latitude,
          point.longitude,
          DEFAULT_INTENSITY_BY_SEVERITY[point.severity] * intensityScale,
        ] as [number, number, number],
    )

    const layer = L.heatLayer(heatPoints, {
      radius,
      blur,
      maxZoom,
      minOpacity,
      gradient,
    })

    layer.addTo(map)
    layerRef.current = layer

    const canvas = (layer as unknown as { _canvas?: HTMLCanvasElement })._canvas
    if (canvas) {
      canvas.style.pointerEvents = 'none'
    }

    return () => {
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [points, map, visible, radius, blur, maxZoom, minOpacity, intensityScale, gradient])

  return null
}
