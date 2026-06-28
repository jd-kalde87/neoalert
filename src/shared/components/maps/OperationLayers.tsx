import { useEffect } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useActiveOperationalData, usePrimaryPlant } from '@shared/hooks/useOperations'
import { configureLeafletDefaults } from './leaflet-setup'
import 'leaflet/dist/leaflet.css'
import './leaflet.css'

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

export function OperationLayers() {
  const { routes, workSites, plants } = useActiveOperationalData()

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

      {plants.map((plant) => (
        <Marker key={plant.id} position={[plant.latitude, plant.longitude]} icon={plantIcon()}>
          <Popup>
            <strong>{plant.name}</strong>
            {plant.description ? <p>{plant.description}</p> : null}
          </Popup>
        </Marker>
      ))}

      {workSites.map((site) => (
        <Marker key={site.id} position={[site.latitude, site.longitude]} icon={siteIcon()}>
          <Popup>
            <strong>{site.name}</strong>
            <p>Sitio de trabajo — destino operativo</p>
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
  const primaryPlant = usePrimaryPlant()

  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const defaultLat = primaryPlant?.latitude ?? 4.695
  const defaultLng = primaryPlant?.longitude ?? -74.13

  const center: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : [defaultLat, defaultLng]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.8125rem] text-slate-500">
        Haz clic en el mapa para ubicar el incidente de seguridad en la vía o punto de riesgo.
      </p>
      <MapContainer
        center={center}
        zoom={11}
        className="h-80 w-full rounded-md border border-slate-200"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <OperationLayers />
        <PickHandler onChange={onChange} />
        {latitude != null && longitude != null ? (
          <Marker position={[latitude, longitude]} />
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
