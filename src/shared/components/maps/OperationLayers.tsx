import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useActiveOperationalData } from '@shared/hooks/useOperations'
import { configureLeafletDefaults, createRiskZoneIcon } from './leaflet-setup'
import 'leaflet/dist/leaflet.css'
import './leaflet.css'

function projectIcon() {
  return L.divIcon({
    className: 'neo-op-marker neo-op-marker--plant',
    html: '<span>P</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function departmentIcon() {
  return L.divIcon({
    className: 'neo-op-marker neo-op-marker--site',
    html: '<span>D</span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export function OperationLayers() {
  const { routes, departments, projects } = useActiveOperationalData()

  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  return (
    <>
      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          pathOptions={{ color: route.color, weight: 4, opacity: 0.65, dashArray: '8 6' }}
        />
      ))}

      {projects.map((project) => (
        <Marker
          key={project.id}
          position={[project.latitude, project.longitude]}
          icon={projectIcon()}
        >
          <Tooltip direction="top" offset={[0, -14]} opacity={0.95} className="neo-map-tooltip">
            {project.name}
          </Tooltip>
          <Popup>
            <strong>{project.name}</strong>
            {project.description ? <p>{project.description}</p> : null}
          </Popup>
        </Marker>
      ))}

      {departments.map((department) => (
        <Marker
          key={department.id}
          position={[department.latitude, department.longitude]}
          icon={departmentIcon()}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={0.95} className="neo-map-tooltip">
            {department.name}
          </Tooltip>
          <Popup>
            <strong>{department.name}</strong>
            <p>Departamento operativo</p>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

interface LocationPickerMapProps {
  latitude: number | null
  longitude: number | null
  onChange: (latitude: number, longitude: number) => void
}

function PickHandler({ onChange }: { onChange: LocationPickerMapProps['onChange'] }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const defaultLat = 10
  const defaultLng = -25

  const center: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : [defaultLat, defaultLng]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.8125rem] text-slate-500">
        Haz clic en el mapa para ubicar el punto en la vía o zona de riesgo.
      </p>
      <MapContainer
        center={center}
        zoom={latitude != null ? 12 : 2}
        className="h-80 w-full rounded-md border border-slate-200"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PickHandler onChange={onChange} />
        {latitude != null && longitude != null ? (
          <Marker position={[latitude, longitude]} icon={createRiskZoneIcon('#dc2626')} />
        ) : null}
      </MapContainer>
      {latitude != null && longitude != null ? (
        <p className="text-[0.8125rem] text-slate-500">
          Coordenadas: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      ) : (
        <p className="text-[0.8125rem] font-semibold text-red-600">
          Debes seleccionar un punto en el mapa
        </p>
      )}
    </div>
  )
}
