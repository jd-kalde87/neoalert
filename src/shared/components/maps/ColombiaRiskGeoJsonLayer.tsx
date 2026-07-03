import { useEffect } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { Layer, PathOptions } from 'leaflet'
import {
  CRITICIDAD_FILL_COLORS,
} from '@shared/constants/colombia-map.constants'
import { useColombiaRiskGeoJson } from '@features/maps/hooks/useColombiaRiskGeoJson'
import { useFilterStore } from '@shared/stores/filterStore'

interface ColombiaRiskGeoJsonLayerProps {
  visible: boolean
}

interface RiskFeatureProperties {
  nombre: string
  departamento: string
  codDane: string
  criticidad: string
  criticidadLabel: string
}

interface RiskGeoFeature {
  type: 'Feature'
  properties: RiskFeatureProperties
  geometry: GeoJSON.Geometry
}

interface RiskGeoCollection {
  type: 'FeatureCollection'
  features: RiskGeoFeature[]
}

function riskStyle(feature?: RiskGeoFeature): PathOptions {
  const criticidad = feature?.properties?.criticidad ?? 'unknown'
  return {
    fillColor: CRITICIDAD_FILL_COLORS[criticidad] ?? '#94a3b8',
    fillOpacity: 0.58,
    color: '#475569',
    weight: 0.65,
    opacity: 0.75,
  }
}

function bindRiskPopup(feature: RiskGeoFeature, layer: Layer) {
  const props = feature.properties
  if (!props) return

  layer.bindPopup(
    `<div class="neo-map-popup">
      <strong>${props.nombre}</strong>
      <p>${props.departamento}</p>
      <p>Nivel: <strong>${props.criticidadLabel || props.criticidad}</strong></p>
      <small>Código DANE: ${props.codDane || '—'}</small>
    </div>`,
  )
}

export function ColombiaRiskGeoJsonLayer({ visible }: ColombiaRiskGeoJsonLayerProps) {
  const map = useMap()
  const { data } = useColombiaRiskGeoJson(visible)
  const projectId = useFilterStore((state) => state.filters.projectId)
  const departmentId = useFilterStore((state) => state.filters.departmentId)
  const municipalityId = useFilterStore((state) => state.filters.municipalityId)

  useEffect(() => {
    if (!visible || !data) return
    const hasTerritorialZoom = Boolean(projectId || departmentId || municipalityId)
    if (hasTerritorialZoom) return

    map.fitBounds(
      [
        [-4.3, -79.9],
        [13.6, -66.7],
      ],
      { padding: [32, 32], maxZoom: 7 },
    )
  }, [visible, data, map, projectId, departmentId, municipalityId])

  if (!visible || !data) return null

  return (
    <GeoJSON
      data={data as RiskGeoCollection}
      style={riskStyle}
      onEachFeature={bindRiskPopup}
    />
  )
}
