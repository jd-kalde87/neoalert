import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useMap } from 'react-leaflet'
import type { MapRisk } from '@shared/types/map.types'
import { createRiskZoneIcon, SEVERITY_COLORS } from './leaflet-setup'

const RISK_LABELS = {
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
  critical: 'Riesgo crítico',
} as const

function buildPopup(risk: MapRisk) {
  const type = risk.riskType ? `<br/>Tipo: ${risk.riskType}` : ''
  const municipality = `<br/>Municipio: ${risk.municipalityLabel}`

  return `<strong>${risk.title}</strong>${type}${municipality}<br/>${risk.description}<br/><em>${RISK_LABELS[risk.severity]}</em><br/>Estado: ${risk.status}`
}

interface RiskClusterLayerProps {
  risks: MapRisk[]
  selectedRiskId: string | null
  onSelectRisk: (id: string) => void
}

export function RiskClusterLayer({ risks, selectedRiskId, onSelectRisk }: RiskClusterLayerProps) {
  const map = useMap()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
    })

    risks.forEach((risk) => {
      const marker = L.marker([risk.latitude, risk.longitude], {
        icon: createRiskZoneIcon(SEVERITY_COLORS[risk.severity]),
      })

      marker.bindPopup(buildPopup(risk))
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event)
        onSelectRisk(risk.id)
      })
      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [risks, map, onSelectRisk])

  useEffect(() => {
    if (!selectedRiskId) return

    const risk = risks.find((item) => item.id === selectedRiskId)
    if (!risk) return

    map.flyTo([risk.latitude, risk.longitude], 14, { duration: 0.8 })
  }, [risks, map, selectedRiskId])

  return null
}
