import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import type { MapLayerMode, MapRisk } from '@shared/types/map.types'
import { WORLD_MAP_VIEW } from '@shared/constants/geo.constants'
import { useMapViewportTarget } from '@shared/hooks/useMapViewport'
import { DynamicTileLayer } from './DynamicTileLayer'
import { HeatmapLayer } from './HeatmapLayer'
import { RiskClusterLayer } from './RiskClusterLayer'
import { MapToolbar } from './MapToolbar'
import { MapViewportController } from './MapViewportController'
import { configureLeafletDefaults, createIncidentPickerIcon, createRiskZoneIcon } from './leaflet-setup'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import './leaflet.css'
import { OperationLayers } from './OperationLayers'
import { ColombiaOverlayLegend } from './ColombiaOverlayLegend'
import { ProjectsLayerLegend } from './ProjectsLayerLegend'
import { ColombiaRiskGeoJsonLayer } from './ColombiaRiskGeoJsonLayer'
import { ColombiaProjectsLayer } from './ColombiaProjectsLayer'
import { useMapStore } from '@features/maps/stores/mapStore'
import {
  COLOMBIA_HEAT_CONFIG,
  COLOMBIA_HEAT_GRADIENTS,
  getColombiaHeatPoints,
} from '@shared/constants/colombia-heat.data'
import { cn } from '@shared/utils/cn'
import { MousePointerClick } from 'lucide-react'

export type MapRegisterMode = 'risk' | 'incident'

function MapClickHandler({
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

const REGISTER_HINTS: Record<MapRegisterMode, string> = {
  risk: 'Clic en el mapa para registrar una zona de riesgo',
  incident: 'Clic en el mapa para registrar un incidente (riesgo materializado)',
}

interface OperativeMapProps {
  risks: MapRisk[]
  layerMode: MapLayerMode
  selectedRiskId: string | null
  onLayerChange: (mode: MapLayerMode) => void
  onSelectRisk: (id: string) => void
  onRegisterRiskAt?: (lat: number, lng: number) => void
  /** Alias con hint de incidente */
  onRegisterIncidentAt?: (lat: number, lng: number) => void
  registerMode?: MapRegisterMode
  draftMarker?: { latitude: number; longitude: number } | null
  showOperations?: boolean
  enableViewportSync?: boolean
  compact?: boolean
  showColombiaLayers?: boolean
}

export function OperativeMap({
  risks,
  layerMode,
  selectedRiskId,
  onLayerChange,
  onSelectRisk,
  onRegisterRiskAt,
  onRegisterIncidentAt,
  registerMode = 'risk',
  draftMarker,
  showOperations = true,
  enableViewportSync = true,
  compact = false,
  showColombiaLayers = true,
}: OperativeMapProps) {
  const viewport = useMapViewportTarget()
  const colombiaOverlay = useMapStore((state) => state.colombiaOverlay)
  const setColombiaOverlay = useMapStore((state) => state.setColombiaOverlay)
  const showProjectsLayer = useMapStore((state) => state.showProjectsLayer)
  const setShowProjectsLayer = useMapStore((state) => state.setShowProjectsLayer)

  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const onMapRegister = onRegisterIncidentAt ?? onRegisterRiskAt
  const activeRegisterMode: MapRegisterMode = onRegisterIncidentAt ? 'incident' : registerMode

  const showHeatmap = layerMode === 'heatmap'
  const showMarkers = layerMode !== 'heatmap'
  const registerEnabled = Boolean(onMapRegister) && !showHeatmap
  const heatmapPoints = risks.map((risk) => ({
    latitude: risk.latitude,
    longitude: risk.longitude,
    severity: risk.severity,
  }))
  const colombiaHeatPoints = useMemo(
    () => (colombiaOverlay === 'armed-groups' ? getColombiaHeatPoints(colombiaOverlay) : []),
    [colombiaOverlay],
  )
  const colombiaHeatConfig =
    colombiaOverlay === 'armed-groups' ? COLOMBIA_HEAT_CONFIG['armed-groups'] : null
  const colombiaHeatGradient =
    colombiaOverlay === 'armed-groups' ? COLOMBIA_HEAT_GRADIENTS['armed-groups'] : null
  const showColombiaRiskLayer = colombiaOverlay === 'department-risk'
  const showColombiaArmedHeat = colombiaOverlay === 'armed-groups'

  return (
    <div className="relative h-full min-h-[320px] w-full">
      <MapContainer
        center={WORLD_MAP_VIEW.center}
        zoom={WORLD_MAP_VIEW.zoom}
        className={`z-0 h-full min-h-[320px] w-full rounded-[inherit]${registerEnabled ? ' cursor-crosshair' : ''}`}
        scrollWheelZoom
      >
        <DynamicTileLayer layerMode={layerMode === 'heatmap' ? 'standard' : layerMode} />
        {enableViewportSync ? <MapViewportController target={viewport} /> : null}
        {showOperations ? <OperationLayers /> : null}
        {showColombiaRiskLayer ? <ColombiaRiskGeoJsonLayer visible /> : null}
        {showProjectsLayer ? <ColombiaProjectsLayer visible /> : null}
        {showColombiaArmedHeat && colombiaHeatConfig && colombiaHeatGradient ? (
          <HeatmapLayer
            points={colombiaHeatPoints}
            visible
            radius={colombiaHeatConfig.radius}
            blur={colombiaHeatConfig.blur}
            maxZoom={colombiaHeatConfig.maxZoom}
            minOpacity={colombiaHeatConfig.minOpacity}
            intensityScale={colombiaHeatConfig.intensityScale}
            gradient={colombiaHeatGradient}
          />
        ) : null}
        {showHeatmap ? (
          <HeatmapLayer
            points={heatmapPoints}
            visible
            radius={COLOMBIA_HEAT_CONFIG.risks.radius}
            blur={COLOMBIA_HEAT_CONFIG.risks.blur}
            maxZoom={COLOMBIA_HEAT_CONFIG.risks.maxZoom}
            minOpacity={COLOMBIA_HEAT_CONFIG.risks.minOpacity}
            intensityScale={COLOMBIA_HEAT_CONFIG.risks.intensityScale}
            gradient={COLOMBIA_HEAT_GRADIENTS.risks}
          />
        ) : null}
        {showMarkers ? (
          <RiskClusterLayer
            risks={risks}
            selectedRiskId={selectedRiskId}
            onSelectRisk={onSelectRisk}
          />
        ) : null}
        {onMapRegister ? (
          <MapClickHandler enabled={registerEnabled} onMapClick={onMapRegister} />
        ) : null}
        {draftMarker ? (
          <Marker
            position={[draftMarker.latitude, draftMarker.longitude]}
            icon={
              activeRegisterMode === 'incident'
                ? createIncidentPickerIcon()
                : createRiskZoneIcon('#dc2626')
            }
          />
        ) : null}
      </MapContainer>

      {registerEnabled ? (
        <div
          className={`pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-xs items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium shadow-sm ${
            activeRegisterMode === 'incident'
              ? 'border border-red-200 bg-white/95 text-red-900'
              : 'border border-amber-200 bg-white/95 text-amber-950'
          }`}
        >
          <MousePointerClick className="size-4 shrink-0" />
          {REGISTER_HINTS[activeRegisterMode]}
        </div>
      ) : null}

      {!compact ? (
        <MapToolbar
          layerMode={layerMode}
          onLayerChange={onLayerChange}
          colombiaOverlay={colombiaOverlay}
          onColombiaOverlayChange={setColombiaOverlay}
          showProjectsLayer={showProjectsLayer}
          onShowProjectsLayerChange={setShowProjectsLayer}
          riskCount={risks.length}
          showColombiaLayers={showColombiaLayers}
        />
      ) : null}

      {colombiaOverlay !== 'none' ? (
        <ColombiaOverlayLegend
          overlay={colombiaOverlay}
          className={cn(
            'absolute right-3 z-[500]',
            showProjectsLayer ? 'bottom-36 max-[768px]:bottom-44' : 'bottom-3 max-[768px]:bottom-14',
          )}
        />
      ) : null}

      {showProjectsLayer ? (
        <ProjectsLayerLegend
          projectCount={18}
          className={cn(
            'absolute right-3 z-[500]',
            colombiaOverlay !== 'none' ? 'bottom-36 max-[768px]:bottom-44' : 'bottom-3 max-[768px]:bottom-14',
          )}
        />
      ) : null}
    </div>
  )
}
