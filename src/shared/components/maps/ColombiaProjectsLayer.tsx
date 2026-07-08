import { useEffect } from 'react'
import { GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import type { Layer, PathOptions } from 'leaflet'
import L from 'leaflet'
import { useColombiaProjectsData } from '@features/maps/hooks/useColombiaProjectsData'
import { useFilterStore } from '@shared/stores/filterStore'
import { createProjectMarkerIcon } from './leaflet-setup'

interface ColombiaProjectsLayerProps {
  visible: boolean
}

interface ProjectAreaProperties {
  noProyect: string
  nombre: string
  empresa: string
  segmento: string
  gerente: string
  tipo: string
  color: string
  municipios: number
}

interface ProjectMunicipioProperties {
  noProyect: string
  nombre: string
  empresa: string
  segmento: string
  municipio: string
  departamento: string
  codDane: string
  color: string
}

interface ProjectGeoFeature<T> {
  type: 'Feature'
  properties: T
  geometry: GeoJSON.Geometry
}

interface ProjectGeoCollection<T> {
  type: 'FeatureCollection'
  features: ProjectGeoFeature<T>[]
}

function areaStyle(feature?: ProjectGeoFeature<ProjectAreaProperties>): PathOptions {
  const color = feature?.properties?.color ?? '#2563eb'
  return {
    fillColor: color,
    fillOpacity: 0.32,
    color,
    weight: 2.5,
    opacity: 0.95,
  }
}

function bindAreaPopup(feature: ProjectGeoFeature<ProjectAreaProperties>, layer: Layer) {
  const props = feature.properties
  layer.bindPopup(
    `<div class="neo-map-popup">
      <strong>${props.nombre}</strong>
      <p>No. proyecto: ${props.noProyect}</p>
      <p>${props.empresa}${props.segmento ? ` · ${props.segmento}` : ''}</p>
      <p>${props.municipios} municipio(s)</p>
      ${props.gerente ? `<small>Gerente: ${props.gerente}</small>` : ''}
    </div>`,
  )
}

function bindMunicipioPopup(
  feature: ProjectGeoFeature<ProjectMunicipioProperties>,
  layer: Layer,
) {
  const props = feature.properties
  layer.bindPopup(
    `<div class="neo-map-popup">
      <strong>${props.municipio}</strong>
      <p>${props.departamento}</p>
      <p>Proyecto: ${props.nombre}</p>
      <small>No. ${props.noProyect} · DANE ${props.codDane || '—'}</small>
    </div>`,
  )
}

export function ColombiaProjectsLayer({ visible }: ColombiaProjectsLayerProps) {
  const map = useMap()
  const { data, isLoading, isError } = useColombiaProjectsData(visible)
  const projectId = useFilterStore((state) => state.filters.projectId)
  const departmentId = useFilterStore((state) => state.filters.departmentId)
  const municipalityId = useFilterStore((state) => state.filters.municipalityId)

  useEffect(() => {
    if (!visible || !data?.areas) return
    const hasTerritorialZoom = Boolean(projectId || departmentId || municipalityId)
    if (hasTerritorialZoom) return

    const boundsLayer = L.geoJSON(data.areas as ProjectGeoCollection<ProjectAreaProperties>)
    const bounds = boundsLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 })
    }
  }, [visible, data, map, projectId, departmentId, municipalityId])

  if (!visible) return null

  if (isLoading) return null

  if (isError || !data) return null

  return (
    <>
      <GeoJSON
        data={data.areas as ProjectGeoCollection<ProjectAreaProperties>}
        style={areaStyle}
        onEachFeature={bindAreaPopup}
      />
      <GeoJSON
        data={data.municipios as ProjectGeoCollection<ProjectMunicipioProperties>}
        pointToLayer={(feature, latlng) => {
          const color =
            (feature?.properties as ProjectMunicipioProperties | undefined)?.color ?? '#2563eb'
          return L.circleMarker(latlng, {
            radius: 7,
            fillColor: color,
            fillOpacity: 0.95,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
          })
        }}
        onEachFeature={bindMunicipioPopup}
      />
      {data.centers.map((project) => (
        <Marker
          key={project.noProyect}
          position={[project.latitude, project.longitude]}
          icon={createProjectMarkerIcon(project.color)}
          zIndexOffset={1200}
        >
          <Popup>
            <div className="neo-map-popup">
              <strong>{project.nombre}</strong>
              <p>No. proyecto: {project.noProyect}</p>
              <p>
                {project.empresa}
                {project.segmento ? ` · ${project.segmento}` : ''}
              </p>
              <p>{project.municipios} municipio(s) en cobertura</p>
              {project.gerente ? <small>Gerente: {project.gerente}</small> : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
