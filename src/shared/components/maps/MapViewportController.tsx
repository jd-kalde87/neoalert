import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { MapViewportTarget } from '@shared/hooks/useMapViewport'

interface MapViewportControllerProps {
  target: MapViewportTarget
}

export function MapViewportController({ target }: MapViewportControllerProps) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(target.center, target.zoom, { duration: 0.9 })
  }, [map, target.center, target.zoom, target.label])

  return null
}
