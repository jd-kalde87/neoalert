import { Link, useParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { KpiCard } from '@shared/components/data-display/KpiCard'
import { ROUTES } from '@shared/constants/routes'
import { ReportBarChart } from '../components/ReportBarChart'
import { ReportsHub } from '../components/ReportsHub'
import { useExportReport, useReport } from '../hooks/useReports'
import { REPORT_TYPE_META, type ReportType } from '../types/report.types'

function isReportType(value: string | undefined): value is ReportType {
  return value === 'attendance' || value === 'security-incidents' || value === 'route-safety'
}

export function ReportsPage() {
  return (
    <section>
      <PageHeader
        title="Reportes de asistencia y seguridad"
        description="Analítica operativa: marcaciones en ruta, incidentes de seguridad y estado de corredores."
      />
      <ReportsHub />
    </section>
  )
}

export function ReportDetailPage() {
  const { reportType } = useParams<{ reportType: string }>()
  const type = isReportType(reportType) ? reportType : undefined
  const meta = type ? REPORT_TYPE_META[type] : null
  const { data, isLoading, isError, refetch } = useReport(type)
  const exportReport = useExportReport()

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!type) return
    const result = await exportReport.mutateAsync({ type, format })
    alert(`Exportación simulada: ${result.filename}`)
  }

  return (
    <section>
      <PageHeader
        title={meta?.title ?? 'Reporte'}
        description={meta?.description}
        actions={
          <>
            <Link to={ROUTES.reports}>
              <Button variant="secondary" size="sm">
                Volver
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={() => handleExport('csv')}>
              CSV
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleExport('excel')}>
              Excel
            </Button>
            <Button size="sm" onClick={() => handleExport('pdf')}>
              PDF
            </Button>
          </>
        }
      />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError || !type}
        loadingTitle="Generando reporte"
        errorTitle="Reporte no disponible"
        onRetry={() => refetch()}
      >
        {data ? (
          <div>
            <p className="mb-4 text-[0.8125rem] text-slate-500">
              Generado: {new Date(data.generatedAt).toLocaleString('es-CO')} · Respeta filtros
              globales activos
            </p>

            <div className="neo-kpi-grid-5 mb-4">
              {data.kpis.map((kpi) => (
                <KpiCard
                  key={kpi.id}
                  label={kpi.label}
                  value={kpi.value}
                  hint={kpi.hint}
                  variant={kpi.variant}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[1.2fr_0.8fr]">
              <Card padding="md">
                <ReportBarChart title="Serie del período" data={data.series} />
              </Card>
              <Card padding="md">
                <h3 className="neo-section-title mb-3">Desglose</h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {data.breakdown.map((row) => (
                    <li key={row.id} className="flex justify-between gap-2 text-sm">
                      <span className="text-slate-500">{row.label}</span>
                      <strong>
                        {row.value}
                        {row.percentage != null ? ` (${row.percentage}%)` : ''}
                      </strong>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </section>
  )
}
