import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { OperativeMap } from '@shared/components/maps/OperativeMap'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { ROUTES } from '@shared/constants/routes'
import { MapIncidentModal } from '@features/maps/components/MapIncidentModal'
import { MapLegend } from '@features/maps/components/MapLegend'
import { MapViewNav } from '@features/maps/components/MapViewNav'
import { useMapIncidents } from '@features/maps/hooks/useMapIncidents'
import { useMapStore } from '@features/maps/stores/mapStore'
import { cn } from '@shared/utils/cn'

export function MapLayout() {
  const location = useLocation()
  const { data, isLoading, isError, refetch } = useMapIncidents()
  const layerMode = useMapStore((state) => state.layerMode)
  const selectedIncidentId = useMapStore((state) => state.selectedIncidentId)
  const setLayerMode = useMapStore((state) => state.setLayerMode)
  const selectIncident = useMapStore((state) => state.selectIncident)

  const [modalOpen, setModalOpen] = useState(false)
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (location.pathname === ROUTES.heatmap) {
      setLayerMode('heatmap')
    }
  }, [location.pathname, setLayerMode])

  const incidents = data?.incidents ?? []

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
        <section className="relative min-h-[50vh] flex-1 lg:min-h-0" aria-label="Mapa operativo">
          <AsyncBoundary
            isLoading={isLoading}
            isError={isError}
            loadingTitle="Cargando mapa"
            errorTitle="No se pudo cargar el mapa"
            onRetry={() => refetch()}
          >
            <OperativeMap
              incidents={incidents}
              layerMode={layerMode}
              selectedIncidentId={selectedIncidentId}
              onLayerChange={setLayerMode}
              onSelectIncident={selectIncident}
              onRegisterIncidentAt={handleMapClick}
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
          </div>

          <div className="neo-scroll flex-1 overflow-y-auto p-4">
            <Outlet
              context={{
                incidents,
                summary: data?.summary,
                selectIncident,
                selectedIncidentId,
              }}
            />
          </div>
        </aside>
      </div>

      <MapIncidentModal
        open={modalOpen}
        latitude={draftLocation?.lat ?? null}
        longitude={draftLocation?.lng ?? null}
        onClose={handleModalClose}
        onCreated={() => void refetch()}
      />
    </>
  )
}
