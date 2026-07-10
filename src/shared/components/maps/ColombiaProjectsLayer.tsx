import { useEffect, useMemo } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Layer } from 'leaflet'
import { useColombiaProjectsData } from '@features/maps/hooks/useColombiaProjectsData'
import { useFilterStore } from '@shared/stores/filterStore'

interface ColombiaProjectsLayerProps {
  visible: boolean
  registerEnabled?: boolean
  onMapRegister?: (lat: number, lng: number) => void
}

interface ProjectMunicipioProperties {
  noProyect: string
  nombre: string
  municipio: string
  departamento: string
}

interface ProjectMunicipioFeature {
  type: 'Feature'
  properties: ProjectMunicipioProperties
  geometry: GeoJSON.Point
}

interface ProjectMunicipioCollection {
  type: 'FeatureCollection'
  features: ProjectMunicipioFeature[]
}

const PROJECT_DOT_STYLE = {
  radius: 5,
  fillColor: '#171717',
  fillOpacity: 0.95,
  color: '#ffffff',
  weight: 1.25,
  opacity: 1,
} as const

function bindProjectPoint(
  feature: ProjectMunicipioFeature,
  layer: Layer,
  registerEnabled: boolean,
  onMapRegister?: (lat: number, lng: number) => void,
) {
  const props = feature.properties
  const label = props.nombre?.trim() || `Proyecto ${props.noProyect}`

  layer.bindTooltip(`<strong>${label}</strong><br/><span>${props.municipio}</span>`, {
    direction: 'top',
    sticky: true,
    className: 'neo-map-tooltip',
    opacity: 0.95,
  })

  if (registerEnabled && onMapRegister) {
    layer.on('click', (event) => {
      L.DomEvent.stopPropagation(event)
      onMapRegister(event.latlng.lat, event.latlng.lng)
    })
    return
  }

  layer.bindPopup(
    `<div class="neo-map-popup">
      <strong>${label}</strong>
      <p>${props.municipio}, ${props.departamento}</p>
      <small>No. proyecto ${props.noProyect}</small>
    </div>`,
  )
}

export function ColombiaProjectsLayer({
  visible,
  registerEnabled = false,
  onMapRegister,
}: ColombiaProjectsLayerProps) {
  const map = useMap()
  const { data, isLoading, isError } = useColombiaProjectsData(visible)
  const projectId = useFilterStore((state) => state.filters.projectId)
  const departmentId = useFilterStore((state) => state.filters.departmentId)
  const municipalityId = useFilterStore((state) => state.filters.municipalityId)

  const onEachFeature = useMemo(
    () => (feature: ProjectMunicipioFeature, layer: Layer) => {
      bindProjectPoint(feature, layer, registerEnabled, onMapRegister)
    },
    [registerEnabled, onMapRegister],
  )

  useEffect(() => {
    if (!visible || !data?.municipios) return
    const hasTerritorialZoom = Boolean(projectId || departmentId || municipalityId)
    if (hasTerritorialZoom) return

    const boundsLayer = L.geoJSON(data.municipios as ProjectMunicipioCollection)
    const bounds = boundsLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 })
    }
  }, [visible, data, map, projectId, departmentId, municipalityId])

  useEffect(() => {
    if (!visible) return
    map.createPane('projectPointsPane')
    const pane = map.getPane('projectPointsPane')
    if (pane) pane.style.zIndex = '650'
  }, [visible, map])

  if (!visible || isLoading || isError || !data?.municipios) return null

  return (
    <GeoJSON
      key="colombia-projects-points"
      data={data.municipios as ProjectMunicipioCollection}
      pane="projectPointsPane"
      pointToLayer={(_feature, latlng) => L.circleMarker(latlng, PROJECT_DOT_STYLE)}
      onEachFeature={onEachFeature}
    />
  )
}
