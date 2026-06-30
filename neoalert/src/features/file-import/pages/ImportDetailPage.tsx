import { Link, useParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { ImportStatusBadge } from '../components/ImportStatusBadge'
import { useImportJob, useImportTemplate } from '../hooks/useImports'

function downloadErrorsCsv(fileName: string, errors: { row: number; field?: string; message: string }[]) {
  const lines = ['fila,campo,mensaje', ...errors.map((e) => `${e.row},${e.field ?? ''},${e.message}`)]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${fileName.replace(/\.csv$/i, '')}_errores.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ImportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useImportJob(id)
  const { data: template } = useImportTemplate(data?.templateId)

  return (
    <section>
      <PageHeader
        title="Detalle de importación"
        description="Resultado del proceso, mapeo aplicado y errores por fila."
        actions={
          <Link to={ROUTES.imports}>
            <Button variant="secondary" size="sm">
              Volver
            </Button>
          </Link>
        }
      />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        loadingTitle="Cargando importación"
        errorTitle="Importación no encontrada"
        onRetry={() => refetch()}
      >
        {data ? (
          <div className="flex flex-col gap-4">
            <Card padding="lg">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="m-0 text-lg">{data.fileName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{data.templateName}</p>
                </div>
                <ImportStatusBadge status={data.status} />
              </div>

              <ul className="m-0 mb-4 grid list-none grid-cols-2 gap-3 p-0 min-[900px]:grid-cols-5">
                <li className="flex flex-col gap-1 text-[0.8125rem]">
                  <span className="text-slate-500">Total filas</span>
                  <strong>{data.totalRows}</strong>
                </li>
                <li className="flex flex-col gap-1 text-[0.8125rem]">
                  <span className="text-slate-500">Válidas</span>
                  <strong>{data.validRows}</strong>
                </li>
                <li className="flex flex-col gap-1 text-[0.8125rem]">
                  <span className="text-slate-500">Con error</span>
                  <strong>{data.errorRows}</strong>
                </li>
                <li className="flex flex-col gap-1 text-[0.8125rem]">
                  <span className="text-slate-500">Subido por</span>
                  <strong>{data.uploadedBy}</strong>
                </li>
                <li className="flex flex-col gap-1 text-[0.8125rem]">
                  <span className="text-slate-500">Fecha</span>
                  <strong>{new Date(data.uploadedAt).toLocaleString('es-CO')}</strong>
                </li>
              </ul>

              {data.validRows > 0 ? (
                <p className="mb-3 text-sm text-emerald-700">
                  {data.validRows} registro(s) publicados en mapas y dashboard.
                  {data.status === 'completed' ? '' : ' Revise los errores de las filas restantes.'}
                </p>
              ) : null}

              {data.errors.length > 0 ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadErrorsCsv(data.fileName, data.errors)}
                >
                  Descargar errores (CSV)
                </Button>
              ) : null}
            </Card>

            {data.mappings.length > 0 ? (
              <Card padding="lg">
                <h3 className="neo-section-title mb-3">Mapeo aplicado</h3>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
                  {data.mappings.map((mapping) => {
                    const label =
                      template?.fields.find((field) => field.key === mapping.targetField)?.label ??
                      mapping.targetField
                    return (
                      <li key={mapping.targetField} className="flex gap-2">
                        <span>{mapping.sourceColumn}</span>
                        <span>→</span>
                        <strong>{label}</strong>
                        <span className="text-slate-400">({mapping.targetField})</span>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            ) : null}

            {data.errors.length > 0 ? (
              <Card padding="lg">
                <h3 className="neo-section-title mb-3">Errores de validación</h3>
                <div className="neo-table-wrap">
                  <table className="neo-table">
                    <thead>
                      <tr>
                        <th>Fila</th>
                        <th>Campo</th>
                        <th>Mensaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.errors.map((error, index) => (
                        <tr key={`${error.row}-${index}`}>
                          <td>{error.row}</td>
                          <td>{error.field ?? '—'}</td>
                          <td>{error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}
      </AsyncBoundary>
    </section>
  )
}
