import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { OperativeMap } from '@shared/components/maps/OperativeMap'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { ROUTES } from '@shared/constants/routes'
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

  useEffect(() => {
    if (location.pathname === ROUTES.heatmap) {
      setLayerMode('heatmap')
    }
  }, [location.pathname, setLayerMode])

  const incidents = data?.incidents ?? []

  return (
    <div
      className={cn(
        '-mx-4 -mb-4 -mt-4 flex h-full min-h-0 flex-col overflow-hidden border-t border-slate-200/80 bg-brand-50',
        'lg:-mx-6 lg:-mb-6 lg:-mt-6 lg:flex-row',
      )}
    >
      <section
        className="relative h-[44vh] shrink-0 overflow-hidden lg:h-full lg:min-h-0 lg:flex-1"
        aria-label="Mapa operativo"
      >
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
          />
        </AsyncBoundary>
      </section>

      <section
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200/80 bg-white',
          'lg:h-full lg:w-[min(100%,24rem)] lg:shrink-0 lg:border-t-0 lg:border-l xl:w-[min(100%,28rem)]',
        )}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden p-4 sm:p-5">
          <Outlet
            context={{
              incidents,
              summary: data?.summary,
              selectIncident,
              selectedIncidentId,
            }}
          />
        </div>
      </section>
    </div>
  )
}
