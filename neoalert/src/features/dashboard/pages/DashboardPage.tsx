import { Link } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { AlertsPanel } from '@shared/components/data-display/AlertsPanel'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { ROUTES } from '@shared/constants/routes'
import { useFilterStore } from '@shared/stores/filterStore'
import { DashboardMapPreview } from '../components/DashboardMapPreview'
import { KpiGrid } from '../components/KpiGrid'
import { useDashboardData } from '../hooks/useDashboardData'

export function DashboardPage() {
  const filters = useFilterStore((state) => state.filters)
  const { data, isLoading, isError, refetch } = useDashboardData()

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Centro de seguridad operativa"
        description="Rutas planta → sitios de trabajo. KPIs de riesgo, mapa de incidentes y alertas para el personal."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Actualizar
            </Button>
            <Link to={ROUTES.maps}>
              <Button size="sm">Ver mapa completo</Button>
            </Link>
          </>
        }
      />

      <p className="-mt-2 text-[0.8125rem] text-slate-500">
        {activeFilterCount} filtros activos — los datos se recalculan automáticamente.
      </p>

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && data?.kpis.length === 0}
        loadingTitle="Cargando dashboard"
        errorTitle="No se pudo cargar el dashboard"
        emptyTitle="Sin datos para el período"
        onRetry={() => refetch()}
      >
        {data ? (
          <>
            <KpiGrid kpis={data.kpis} />

            <section
              className="grid min-h-[420px] grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.35fr_0.9fr]"
              aria-label="Mapa y alertas"
            >
              <DashboardMapPreview
                activeIncidents={data.mapSummary.activeIncidents}
                zonesMonitored={data.mapSummary.zonesMonitored}
                crewsOnField={data.mapSummary.crewsOnField}
              />
              <AlertsPanel alerts={data.alerts} />
            </section>
          </>
        ) : null}
      </AsyncBoundary>
    </div>
  )
}
