import { useEffect, useMemo } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Layer, PathOptions } from 'leaflet'
import { useColombiaRiskGeoJson } from '@features/maps/hooks/useColombiaRiskGeoJson'
import { useFilterStore } from '@shared/stores/filterStore'
import { CRITICIDAD_FILL_COLORS } from '@shared/constants/colombia-map.constants'
import {
  type ColombiaRiskGeoCollection,
  type ColombiaRiskGeoFeature,
} from '@shared/utils/colombiaRiskGeo'

interface ColombiaRiskGeoJsonLayerProps {
  visible: boolean
  registerEnabled?: boolean
  onMapRegister?: (lat: number, lng: number) => void
}

function riskPolygonStyle(feature?: ColombiaRiskGeoFeature): PathOptions {
  const criticidad = feature?.properties?.criticidad ?? 'unknown'
  const fillColor = CRITICIDAD_FILL_COLORS[criticidad] ?? CRITICIDAD_FILL_COLORS.unknown

  return {
    fillColor,
    fillOpacity: 0.24,
    color: fillColor,
    weight: 0.75,
    opacity: 0.5,
  }
}

function bindRiskLayer(
  feature: ColombiaRiskGeoFeature,
  layer: Layer,
  registerEnabled: boolean,
  onMapRegister?: (lat: number, lng: number) => void,
) {
  const props = feature.properties
  if (!props) return

  layer.bindTooltip(
    `<strong>${props.nombre}</strong><br/><span>${props.criticidadLabel || props.criticidad}</span>`,
    {
      direction: 'top',
      sticky: true,
      className: 'neo-map-tooltip',
      opacity: 0.95,
    },
  )

  if (registerEnabled && onMapRegister) {
    layer.on('click', (event) => {
      L.DomEvent.stopPropagation(event)
      onMapRegister(event.latlng.lat, event.latlng.lng)
    })
    return
  }

  layer.bindPopup(
    `<div class="neo-map-popup">
      <strong>${props.nombre}</strong>
      <p>${props.departamento}</p>
      <p>Nivel: <strong>${props.criticidadLabel || props.criticidad}</strong></p>
      <small>Código DANE: ${props.codDane || '—'}</small>
    </div>`,
  )
}

export function ColombiaRiskGeoJsonLayer({
  visible,
  registerEnabled = false,
  onMapRegister,
}: ColombiaRiskGeoJsonLayerProps) {
  const map = useMap()
  const { data } = useColombiaRiskGeoJson(visible)
  const projectId = useFilterStore((state) => state.filters.projectId)
  const departmentId = useFilterStore((state) => state.filters.departmentId)
  const municipalityId = useFilterStore((state) => state.filters.municipalityId)

  const onEachFeature = useMemo(
    () => (feature: ColombiaRiskGeoFeature, layer: Layer) => {
      bindRiskLayer(feature, layer, registerEnabled, onMapRegister)
    },
    [registerEnabled, onMapRegister],
  )

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
      data={data as ColombiaRiskGeoCollection}
      style={riskPolygonStyle}
      onEachFeature={onEachFeature}
    />
  )
}
