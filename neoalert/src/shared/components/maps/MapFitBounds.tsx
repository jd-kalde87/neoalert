import { useEffect } from 'react'
import L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { MapIncident } from '@shared/types/map.types'

interface MapFitBoundsProps {
  incidents: MapIncident[]
  /** Evita re-centrar al seleccionar un incidente en la lista. */
  fitKey?: string
}

export function MapFitBounds({ incidents, fitKey }: MapFitBoundsProps) {
  const map = useMap()

  useEffect(() => {
    if (incidents.length === 0) return

    if (incidents.length === 1) {
      const incident = incidents[0]!
      map.setView([incident.latitude, incident.longitude], 8, { animate: true })
      return
    }

    const bounds = L.latLngBounds(
      incidents.map((incident) => [incident.latitude, incident.longitude] as [number, number]),
    )
    map.fitBounds(bounds.pad(0.12), { animate: true, maxZoom: 8 })
  }, [fitKey, incidents, map])

  return null
}
