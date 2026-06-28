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
    <div className={cn('-m-4 flex min-h-[calc(100vh-8rem)] flex-col lg:-m-5 lg:min-h-[calc(100vh-9rem)] lg:flex-row')}>
      <section className="relative min-h-[45vh] flex-1 lg:min-h-0" aria-label="Mapa operativo">
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

      <section className="neo-scroll w-full overflow-y-auto border-t border-slate-200 bg-white lg:w-[22rem] lg:shrink-0 lg:border-t-0 lg:border-l xl:w-[26rem]">
        <Outlet
          context={{
            incidents,
            summary: data?.summary,
            selectIncident,
            selectedIncidentId,
          }}
        />
      </section>
    </div>
  )
}
