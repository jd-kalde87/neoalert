import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { ROUTES } from '@shared/constants/routes'
import { IncidentFilters } from '../components/IncidentFilters'
import { IncidentTable } from '../components/IncidentTable'
import { useIncidents } from '../hooks/useIncidents'
import type { IncidentListFilters } from '../types/incident.types'

export function IncidentsListPage() {
  const [localFilters, setLocalFilters] = useState<IncidentListFilters>({})
  const { data, isLoading, isError, refetch } = useIncidents(localFilters)

  return (
    <section>
      <PageHeader
        title="Incidentes de seguridad"
        description="Registro de riesgos materializados. Las zonas de riesgo preventivas se gestionan en el mapa de riesgos."
        actions={
          <>
            <Link to={ROUTES.maps}>
              <Button variant="secondary">Mapa de riesgos</Button>
            </Link>
            <Link to={ROUTES.incidentNew}>
              <Button>Registrar incidente</Button>
            </Link>
          </>
        }
      />

      <IncidentFilters filters={localFilters} onChange={setLocalFilters} />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && data?.length === 0}
        loadingTitle="Cargando incidentes de seguridad"
        errorTitle="No se pudo cargar el listado"
        emptyTitle="Sin incidentes activos"
        emptyDescription="No hay incidentes de seguridad para los filtros seleccionados."
        onRetry={() => refetch()}
      >
        {data && data.length > 0 ? <IncidentTable incidents={data} /> : null}
      </AsyncBoundary>
    </section>
  )
}
