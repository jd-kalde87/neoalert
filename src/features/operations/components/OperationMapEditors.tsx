import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { RouteCoordinate } from '@shared/types/operations.types'
import { useProjects, useDepartments, useOperationalRoutes } from '@shared/hooks/useOperations'
import { configureLeafletDefaults } from '@shared/components/maps/leaflet-setup'
import 'leaflet/dist/leaflet.css'
import '@shared/components/maps/leaflet.css'

function plantIcon() {
  return L.divIcon({
    className: 'neo-op-marker neo-op-marker--plant',
    html: '<span>P</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function siteIcon() {
  return L.divIcon({
    className: 'neo-op-marker neo-op-marker--site',
    html: '<span>S</span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function draftIcon(label: string, color: string) {
  return L.divIcon({
    className: 'neo-op-marker',
    html: `<span style="background:${color};font-size:0.65rem">${label}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

interface MapCenterProps {
  center: RouteCoordinate
  zoom?: number
}

function MapCenter({ center, zoom }: MapCenterProps) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

interface ClickHandlerProps {
  onClick: (lat: number, lng: number) => void
  enabled?: boolean
}

function ClickHandler({ onClick, enabled = true }: ClickHandlerProps) {
  useMapEvents({
    click(event) {
      if (!enabled) return
      onClick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export interface OperationMapContextProps {
  excludeProjectId?: string
  excludeDepartmentId?: string
  excludeRouteId?: string
  showRoutes?: boolean
}

function OperationMapContext({
  excludeProjectId,
  excludeDepartmentId,
  excludeRouteId,
  showRoutes = true,
}: OperationMapContextProps) {
  const projects = useProjects()
  const departments = useDepartments()
  const routes = useOperationalRoutes()

  return (
    <>
      {showRoutes
        ? routes
            .filter((route) => route.id !== excludeRouteId && route.active)
            .map((route) => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                pathOptions={{
                  color: route.color,
                  weight: 3,
                  opacity: 0.35,
                  dashArray: '6 8',
                }}
              />
            ))
        : null}

      {projects
        .filter((project) => project.id !== excludeProjectId && project.active)
        .map((project) => (
          <Marker key={project.id} position={[project.latitude, project.longitude]} icon={plantIcon()}>
            <Popup>
              <strong>{project.name}</strong>
              <p className="text-xs text-slate-500">Proyecto existente</p>
            </Popup>
          </Marker>
        ))}

      {departments
        .filter((department) => department.id !== excludeDepartmentId && department.active)
        .map((department) => (
          <Marker
            key={department.id}
            position={[department.latitude, department.longitude]}
            icon={siteIcon()}
          >
            <Popup>
              <strong>{department.name}</strong>
              <p className="text-xs text-slate-500">Departamento existente</p>
            </Popup>
          </Marker>
        ))}
    </>
  )
}

export interface GraphicPointPickerProps extends OperationMapContextProps {
  latitude: number | null
  longitude: number | null
  onChange: (latitude: number, longitude: number) => void
  markerLabel: string
  markerColor: string
  hint: string
  defaultCenter?: RouteCoordinate
  heightClass?: string
}

export function GraphicPointPicker({
  latitude,
  longitude,
  onChange,
  markerLabel,
  markerColor,
  hint,
  defaultCenter = [10, -25],
  excludeProjectId,
  excludeDepartmentId,
  heightClass = 'h-[420px]',
}: GraphicPointPickerProps) {
  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const center: RouteCoordinate =
    latitude != null && longitude != null ? [latitude, longitude] : defaultCenter

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-500">{hint}</p>
      <div className={`overflow-hidden rounded-xl border border-slate-200 ${heightClass}`}>
        <MapContainer center={center} zoom={11} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <OperationMapContext
            excludeProjectId={excludeProjectId}
            excludeDepartmentId={excludeDepartmentId}
          />
          <ClickHandler onClick={onChange} />
          {latitude != null && longitude != null ? (
            <>
              <MapCenter center={[latitude, longitude]} />
              <Marker
                position={[latitude, longitude]}
                icon={draftIcon(markerLabel, markerColor)}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const pos = event.target.getLatLng()
                    onChange(pos.lat, pos.lng)
                  },
                }}
              />
            </>
          ) : null}
        </MapContainer>
      </div>
      {latitude != null && longitude != null ? (
        <p className="text-xs tabular-nums text-slate-500">
          Coordenadas: {latitude.toFixed(5)}, {longitude.toFixed(5)} — arrastra el marcador o haz clic
          en el mapa
        </p>
      ) : (
        <p className="text-xs font-medium text-amber-700">Haz clic en el mapa para ubicar el punto</p>
      )}
    </div>
  )
}

export interface RouteEditorMapProps extends OperationMapContextProps {
  plantPosition: RouteCoordinate | null
  sitePosition: RouteCoordinate | null
  routeColor: string
  coordinates: RouteCoordinate[]
  waypoints: RouteCoordinate[]
  onAddWaypoint: (lat: number, lng: number) => void
  isDrawing?: boolean
}

export function RouteEditorMap({
  plantPosition,
  sitePosition,
  routeColor,
  coordinates,
  waypoints,
  onAddWaypoint,
  isDrawing = true,
  excludeRouteId,
}: RouteEditorMapProps) {
  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const defaultCenter: RouteCoordinate = plantPosition ?? sitePosition ?? [10, -25]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-500">
        Las rutas existentes se muestran atenuadas. El trazado azul sigue las vías de OpenStreetMap (OSRM).
        Haz clic para añadir puntos intermedios y recalcular.
      </p>
      <div className="h-[480px] overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={defaultCenter} zoom={11} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <OperationMapContext excludeRouteId={excludeRouteId} />
          <ClickHandler onClick={onAddWaypoint} enabled={isDrawing} />

          {coordinates.length >= 2 ? (
            <Polyline
              positions={coordinates}
              pathOptions={{ color: routeColor, weight: 5, opacity: 0.85 }}
            />
          ) : null}

          {plantPosition ? (
            <Marker position={plantPosition} icon={plantIcon()}>
              <Popup>Origen (planta)</Popup>
            </Marker>
          ) : null}

          {sitePosition ? (
            <Marker position={sitePosition} icon={siteIcon()}>
              <Popup>Destino (sitio)</Popup>
            </Marker>
          ) : null}

          {waypoints.map((point, index) => (
            <Marker
              key={`wp-${index}-${point[0]}-${point[1]}`}
              position={point}
              icon={draftIcon(String(index + 1), '#6366f1')}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
