import { useEffect } from 'react'
import { MapContainer } from 'react-leaflet'
import type { MapIncident, MapLayerMode } from '@shared/types/map.types'
import { DynamicTileLayer } from './DynamicTileLayer'
import { HeatmapLayer } from './HeatmapLayer'
import { IncidentClusterLayer } from './IncidentClusterLayer'
import { MapToolbar } from './MapToolbar'
import { configureLeafletDefaults } from './leaflet-setup'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './leaflet.css'
import { OperationLayers } from './OperationLayers'
import { usePrimaryPlant } from '@shared/hooks/useOperations'

const DEFAULT_ZOOM = 11
const FALLBACK_CENTER: [number, number] = [4.695, -74.13]

interface OperativeMapProps {
  incidents: MapIncident[]
  layerMode: MapLayerMode
  selectedIncidentId: string | null
  onLayerChange: (mode: MapLayerMode) => void
  onSelectIncident: (id: string) => void
}

export function OperativeMap({
  incidents,
  layerMode,
  selectedIncidentId,
  onLayerChange,
  onSelectIncident,
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

  return (
    <div className="relative h-full min-h-[320px] w-full">
      <MapContainer
        center={defaultCenter}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-full min-h-[320px] w-full rounded-[inherit]"
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
      </MapContainer>

      <div
        className="absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white/95 px-2.5 py-2 text-[0.6875rem] text-slate-500"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-brand-900" /> Planta central
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" /> Sitio de trabajo
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" /> Incidente de seguridad
        </span>
      </div>

      <MapToolbar
        layerMode={layerMode}
        onLayerChange={onLayerChange}
        incidentCount={incidents.length}
      />
    </div>
  )
}
