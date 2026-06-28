import { useState } from 'react'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { KpiCard } from '@shared/components/data-display/KpiCard'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { AuditFilters } from '../components/AuditFilters'
import { AuditTable } from '../components/AuditTable'
import { useAuditLogs, useAuditSummary, useExportAuditLogs } from '../hooks/useAudit'
import type { AuditListFilters } from '../types/audit.types'

export function AuditPage() {
  const [localFilters, setLocalFilters] = useState<AuditListFilters>({})
  const { data, isLoading, isError, refetch } = useAuditLogs(localFilters)
  const { data: summary } = useAuditSummary(localFilters)
  const exportLogs = useExportAuditLogs(localFilters)

  const handleExport = async () => {
    const result = await exportLogs.mutateAsync()
    alert(`Exportación simulada: ${result.filename} (${result.rowCount} eventos)`)
  }

  return (
    <section>
      <PageHeader
        title="Auditoría"
        description="Trazabilidad de acciones sobre incidentes, asistencia, importaciones y configuración operativa."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={exportLogs.isPending}
          >
            Exportar CSV
          </Button>
        }
      />

      {summary ? (
        <div className="neo-kpi-grid mb-4">
          <KpiCard label="Eventos filtrados" value={summary.totalEvents} />
          <KpiCard label="Hoy" value={summary.todayEvents} />
          <KpiCard label="Acciones críticas" value={summary.criticalActions} variant="warning" />
          <KpiCard label="Fallidos" value={summary.failedEvents} variant="danger" />
        </div>
      ) : null}

      <Card padding="lg">
        <AuditFilters filters={localFilters} onChange={setLocalFilters} />

        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && data?.length === 0}
          loadingTitle="Cargando auditoría"
          errorTitle="No se pudo cargar el historial"
          emptyTitle="Sin eventos"
          emptyDescription="No hay registros de auditoría para los filtros seleccionados."
          onRetry={() => refetch()}
        >
          {data && data.length > 0 ? <AuditTable entries={data} /> : null}
        </AsyncBoundary>
      </Card>
    </section>
  )
}
