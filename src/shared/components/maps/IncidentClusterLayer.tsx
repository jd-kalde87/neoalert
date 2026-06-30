import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useMap } from 'react-leaflet'
import type { MapIncident } from '@shared/types/map.types'
import { createSeverityIcon, SEVERITY_COLORS } from './leaflet-setup'

const RISK_LABELS = {
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
  critical: 'Riesgo crítico',
} as const

function buildPopup(incident: MapIncident) {
  const transit = incident.blocksTransit
    ? '<br/><strong style="color:#dc2626">⛔ Bloquea desplazamiento</strong>'
    : '<br/>Precaución en ruta'
  const route = incident.routeName ? `<br/>Ruta: ${incident.routeName}` : ''
  const type = incident.incidentType ? `<br/>Tipo: ${incident.incidentType}` : ''

  return `<strong>${incident.title}</strong>${type}${route}<br/>${incident.description}<br/><em>${RISK_LABELS[incident.severity]}</em>${transit}`
}

interface IncidentClusterLayerProps {
  incidents: MapIncident[]
  selectedIncidentId: string | null
  onSelectIncident: (id: string) => void
}

export function IncidentClusterLayer({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}: IncidentClusterLayerProps) {
  const map = useMap()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
    })

    incidents.forEach((incident) => {
      const marker = L.marker([incident.latitude, incident.longitude], {
        icon: createSeverityIcon(SEVERITY_COLORS[incident.severity]),
      })

      marker.bindPopup(buildPopup(incident))
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event)
        onSelectIncident(incident.id)
      })
      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [incidents, map, onSelectIncident])

  useEffect(() => {
    if (!selectedIncidentId) return

    const incident = incidents.find((item) => item.id === selectedIncidentId)
    if (!incident) return

    map.flyTo([incident.latitude, incident.longitude], 14, { duration: 0.8 })
  }, [incidents, map, selectedIncidentId])

  return null
}
