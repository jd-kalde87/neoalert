import { useEffect } from 'react'
import { MapContainer } from 'react-leaflet'
import type { MapIncident, MapLayerMode } from '@shared/types/map.types'
import { DynamicTileLayer } from './DynamicTileLayer'
import { HeatmapLayer } from './HeatmapLayer'
import { HeatmapRiskLegend } from './HeatmapRiskLegend'
import { IncidentClusterLayer } from './IncidentClusterLayer'
import { MapToolbar } from './MapToolbar'
import { MapZoomControl } from './MapZoomControl'
import { configureLeafletDefaults } from './leaflet-setup'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './leaflet.css'
import { OperationLayers } from './OperationLayers'
import { MapFitBounds } from './MapFitBounds'
import { usePrimaryPlant } from '@shared/hooks/useOperations'

const DEFAULT_ZOOM = 6
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
  const showMarkers = !showHeatmap
  const showOperations = layerMode !== 'heatmap'

  const fitKey = `${layerMode}-${incidents.length}-${incidents.map((i) => i.id).join(',')}`

  return (
    <div className="neo-operative-map flex h-full min-h-[360px] w-full flex-col overflow-hidden rounded-none bg-white lg:rounded-bl-2xl">
      <MapToolbar
        layerMode={layerMode}
        onLayerChange={onLayerChange}
        incidentCount={incidents.length}
      />

      <div className="relative isolate min-h-0 flex-1 bg-slate-100">
        <MapContainer
          center={defaultCenter}
          zoom={DEFAULT_ZOOM}
          className="z-0 h-full w-full !bg-slate-100"
          scrollWheelZoom
          zoomControl={false}
        >
          <DynamicTileLayer layerMode={layerMode} />
          <MapZoomControl />
          <MapFitBounds incidents={incidents} fitKey={fitKey} />
          {showOperations ? <OperationLayers /> : null}
          {showHeatmap ? <HeatmapLayer incidents={incidents} visible /> : null}
          {showMarkers ? (
            <IncidentClusterLayer
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={onSelectIncident}
            />
          ) : null}
        </MapContainer>

        {showHeatmap ? (
          <HeatmapRiskLegend />
        ) : (
          <div
            className="pointer-events-none absolute bottom-4 left-4 z-[400] flex max-w-[calc(100%-5rem)] flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 text-[0.6875rem] text-slate-600 shadow-panel backdrop-blur-sm"
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block size-2.5 rounded-full bg-brand-900" /> Planta central
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block size-2.5 rounded-full bg-emerald-600" /> Sitio de trabajo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block size-2.5 rounded-full bg-red-500" /> Incidente
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
