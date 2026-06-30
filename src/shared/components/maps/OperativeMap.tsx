import { useEffect } from 'react'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import type { MapIncident, MapLayerMode } from '@shared/types/map.types'
import { DynamicTileLayer } from './DynamicTileLayer'
import { HeatmapLayer } from './HeatmapLayer'
import { IncidentClusterLayer } from './IncidentClusterLayer'
import { MapToolbar } from './MapToolbar'
import { configureLeafletDefaults, createIncidentPickerIcon } from './leaflet-setup'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './leaflet.css'
import { OperationLayers } from './OperationLayers'
import { usePrimaryPlant } from '@shared/hooks/useOperations'
import { MousePointerClick } from 'lucide-react'

const DEFAULT_ZOOM = 11
const FALLBACK_CENTER: [number, number] = [4.695, -74.13]

function MapIncidentClickHandler({
  enabled,
  onMapClick,
}: {
  enabled: boolean
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(event) {
      if (!enabled) return
      onMapClick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

interface OperativeMapProps {
  incidents: MapIncident[]
  layerMode: MapLayerMode
  selectedIncidentId: string | null
  onLayerChange: (mode: MapLayerMode) => void
  onSelectIncident: (id: string) => void
  onRegisterIncidentAt?: (lat: number, lng: number) => void
  draftMarker?: { latitude: number; longitude: number } | null
}

export function OperativeMap({
  incidents,
  layerMode,
  selectedIncidentId,
  onLayerChange,
  onSelectIncident,
  onRegisterIncidentAt,
  draftMarker,
}: OperativeMapProps) {
  const primaryPlant = usePrimaryPlant()
  const defaultCenter: [number, number] = primaryPlant
    ? [primaryPlant.latitude, primaryPlant.longitude]
    : FALLBACK_CENTER

  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const showHeatmap = layerMode === 'heatmap'
  const showMarkers = layerMode !== 'heatmap'
  const registerEnabled = Boolean(onRegisterIncidentAt) && !showHeatmap

  return (
    <div className="relative h-full min-h-[320px] w-full">
      <MapContainer
        center={defaultCenter}
        zoom={DEFAULT_ZOOM}
        className={`z-0 h-full min-h-[320px] w-full rounded-[inherit]${registerEnabled ? ' cursor-crosshair' : ''}`}
        scrollWheelZoom
      >
        <DynamicTileLayer layerMode={layerMode} />
        <OperationLayers />
        {showHeatmap ? <HeatmapLayer incidents={incidents} visible /> : null}
        {showMarkers ? (
          <IncidentClusterLayer
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={onSelectIncident}
          />
        ) : null}
        {onRegisterIncidentAt ? (
          <MapIncidentClickHandler enabled={registerEnabled} onMapClick={onRegisterIncidentAt} />
        ) : null}
        {draftMarker ? (
          <Marker
            position={[draftMarker.latitude, draftMarker.longitude]}
            icon={createIncidentPickerIcon()}
          />
        ) : null}
      </MapContainer>

      {registerEnabled ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-xs items-center gap-2 rounded-lg border border-brand-200 bg-white/95 px-3 py-2 text-xs font-medium text-brand-900 shadow-sm">
          <MousePointerClick className="size-4 shrink-0" />
          Clic en el mapa para registrar un incidente
        </div>
      ) : null}

      <MapToolbar
        layerMode={layerMode}
        onLayerChange={onLayerChange}
        incidentCount={incidents.length}
      />
    </div>
  )
}
