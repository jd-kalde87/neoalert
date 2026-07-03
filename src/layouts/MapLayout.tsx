import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { OperativeMap } from '@shared/components/maps/OperativeMap'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { ROUTES } from '@shared/constants/routes'
import { MapRiskModal } from '@features/risks/components/MapRiskModal'
import { useMapRisks } from '@features/risks/hooks/useMapRisks'
import { MapLegend } from '@features/maps/components/MapLegend'
import { ColombiaOverlayLegend } from '@shared/components/maps/ColombiaOverlayLegend'
import { MapViewNav } from '@features/maps/components/MapViewNav'
import { useMapStore } from '@features/maps/stores/mapStore'
import { cn } from '@shared/utils/cn'

export function MapLayout() {
  const location = useLocation()
  const { data, isLoading, isError, refetch } = useMapRisks()
  const layerMode = useMapStore((state) => state.layerMode)
  const selectedRiskId = useMapStore((state) => state.selectedRiskId)
  const setLayerMode = useMapStore((state) => state.setLayerMode)
  const selectRisk = useMapStore((state) => state.selectRisk)
  const colombiaOverlay = useMapStore((state) => state.colombiaOverlay)

  const [modalOpen, setModalOpen] = useState(false)
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (location.pathname === ROUTES.heatmap) {
      setLayerMode('heatmap')
    } else if (location.pathname === ROUTES.maps) {
      setLayerMode('standard')
    }
  }, [location.pathname, setLayerMode])

  const risks = data?.risks ?? []

  const handleMapClick = (lat: number, lng: number) => {
    setDraftLocation({ lat, lng })
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setDraftLocation(null)
  }

  return (
    <>
      <div
        className={cn(
          '-m-3 flex min-h-[calc(100vh-6.5rem)] flex-col lg:-m-4 lg:min-h-[calc(100vh-7rem)] lg:flex-row',
        )}
      >
        <section className="relative min-h-[50vh] flex-1 lg:min-h-0" aria-label="Mapa de riesgos">
          <AsyncBoundary
            isLoading={isLoading}
            isError={isError}
            loadingTitle="Cargando mapa de riesgos"
            errorTitle="No se pudo cargar el mapa"
            onRetry={() => refetch()}
          >
            <OperativeMap
              risks={risks}
              layerMode={layerMode}
              selectedRiskId={selectedRiskId}
              onLayerChange={setLayerMode}
              onSelectRisk={selectRisk}
              onRegisterRiskAt={handleMapClick}
              draftMarker={
                draftLocation
                  ? { latitude: draftLocation.lat, longitude: draftLocation.lng }
                  : null
              }
            />
          </AsyncBoundary>
        </section>

        <aside className="flex w-full flex-col border-t border-slate-200 bg-slate-50/80 lg:w-[min(100%,22rem)] lg:shrink-0 lg:border-t-0 lg:border-l xl:w-[26rem]">
          <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
            <MapViewNav />
            <MapLegend compact />
            {colombiaOverlay !== 'none' ? (
              <ColombiaOverlayLegend overlay={colombiaOverlay} className="pointer-events-none" />
            ) : (
              <p className="text-[0.6875rem] leading-relaxed text-slate-500">
                Active <strong>Riesgo CO</strong> para ver polígonos municipales del shapefile
                oficial 2026. Clic en un municipio para ver su nivel de criticidad.
              </p>
            )}
          </div>

          <div className="neo-scroll flex-1 overflow-y-auto p-4">
            <Outlet
              context={{
                risks,
                summary: data?.summary,
                selectRisk,
                selectedRiskId,
              }}
            />
          </div>
        </aside>
      </div>

      <MapRiskModal
        open={modalOpen}
        latitude={draftLocation?.lat ?? null}
        longitude={draftLocation?.lng ?? null}
        onClose={handleModalClose}
        onCreated={() => void refetch()}
      />
    </>
  )
}
