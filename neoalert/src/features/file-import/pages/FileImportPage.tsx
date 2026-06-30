import { Link } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { ImportHistoryTable } from '../components/ImportHistoryTable'
import { useImportJobs } from '../hooks/useImports'

export function FileImportPage() {
  const { data, isLoading, isError, refetch } = useImportJobs()

  return (
    <section>
      <PageHeader
        title="Importaciones"
        description="Carga masiva de incidentes, marcaciones y datos operativos con validación y reporte de errores."
        actions={
          <Link to={ROUTES.importUpload}>
            <Button>Nueva importación</Button>
          </Link>
        }
      />

      <Card padding="lg">
        <h2 className="neo-section-title mb-4">Historial de importaciones</h2>
        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
          loadingTitle="Cargando historial"
          errorTitle="No se pudo cargar el historial"
          emptyTitle="Sin importaciones registradas"
          onRetry={() => refetch()}
        >
          <ImportHistoryTable jobs={data ?? []} />
        </AsyncBoundary>
      </Card>
    </section>
  )
}
