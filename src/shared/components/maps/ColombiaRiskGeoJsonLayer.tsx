import { useEffect, useMemo } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { Layer, PathOptions } from 'leaflet'
import { useColombiaRiskGeoJson } from '@features/maps/hooks/useColombiaRiskGeoJson'
import { useFilterStore } from '@shared/stores/filterStore'
import {
  COLOMBIA_HEAT_CONFIG,
  COLOMBIA_HEAT_GRADIENTS,
} from '@shared/constants/colombia-heat.data'
import {
  geoJsonToRiskHeatPoints,
  type ColombiaRiskGeoCollection,
  type ColombiaRiskGeoFeature,
} from '@shared/utils/colombiaRiskGeo'
import { HeatmapLayer } from './HeatmapLayer'

interface ColombiaRiskGeoJsonLayerProps {
  visible: boolean
}

/** Polígonos casi invisibles: solo para clic y popup municipal */
const INTERACTION_STYLE: PathOptions = {
  fillColor: '#0f172a',
  fillOpacity: 0.02,
  color: 'transparent',
  weight: 0,
  opacity: 0,
}

function bindRiskPopup(feature: ColombiaRiskGeoFeature, layer: Layer) {
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

  const heatPoints = useMemo(() => {
    if (!data) return []
    return geoJsonToRiskHeatPoints(data as ColombiaRiskGeoCollection)
  }, [data])

  const heatConfig = COLOMBIA_HEAT_CONFIG['department-risk']

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
    <>
      <HeatmapLayer
        points={heatPoints}
        visible
        radius={heatConfig.radius}
        blur={heatConfig.blur}
        maxZoom={heatConfig.maxZoom}
        minOpacity={heatConfig.minOpacity}
        intensityScale={heatConfig.intensityScale}
        gradient={COLOMBIA_HEAT_GRADIENTS['department-risk']}
      />
      <GeoJSON
        data={data as ColombiaRiskGeoCollection}
        style={() => INTERACTION_STYLE}
        onEachFeature={bindRiskPopup}
      />
    </>
  )
}
