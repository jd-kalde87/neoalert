import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Textarea } from '@shared/components/ui/Textarea'
import { ROUTES } from '@shared/constants/routes'
import { IncidentSeverityBadge } from '../components/IncidentSeverityBadge'
import { IncidentStatusBadge } from '../components/IncidentStatusBadge'
import { IncidentTimeline } from '../components/IncidentTimeline'
import {
  useAddIncidentComment,
  useIncidentDetail,
  useUpdateIncidentStatus,
} from '../hooks/useIncidents'
import type { IncidentStatus } from '../types/incident.types'
import { INCIDENT_SEVERITY_HINTS, INCIDENT_STATUS_LABELS } from '../types/incident.types'

const STATUS_ACTIONS: IncidentStatus[] = ['in_review', 'in_progress', 'resolved', 'closed']

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useIncidentDetail(id)
  const addComment = useAddIncidentComment(id ?? '')
  const updateStatus = useUpdateIncidentStatus(id ?? '')
  const [comment, setComment] = useState('')

  const handleAddComment = async () => {
    if (!comment.trim()) return
    await addComment.mutateAsync(comment.trim())
    setComment('')
  }

  const handleStatusChange = async (status: IncidentStatus) => {
    await updateStatus.mutateAsync({ status })
  }

  return (
    <section>
      <PageHeader
        title={data?.code ?? 'Incidente de seguridad'}
        description={data?.title ?? 'Cargando información...'}
        actions={
          <>
            {data?.latitude != null ? (
              <Link to={`${ROUTES.maps}?incident=${data.id}`}>
                <Button variant="secondary" size="sm">
                  Ver en mapa
                </Button>
              </Link>
            ) : null}
            <Link to={ROUTES.incidents}>
              <Button variant="secondary">Volver al listado</Button>
            </Link>
          </>
        }
      />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        loadingTitle="Cargando incidente"
        errorTitle="No se pudo cargar el incidente"
        onRetry={() => refetch()}
      >
        {data ? (
          <div className="grid grid-cols-1 items-start gap-4 min-[1024px]:grid-cols-[1.2fr_0.8fr]">
            <Card padding="lg">
              <div className="mb-3 flex flex-wrap gap-2">
                <IncidentSeverityBadge severity={data.severity} />
                <IncidentStatusBadge status={data.status} />
                {data.blocksTransit ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.6875rem] font-bold uppercase text-red-800">
                    No transitar
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-bold uppercase text-amber-800">
                    Precaución en ruta
                  </span>
                )}
              </div>

              <p className="mb-4 text-sm font-semibold text-amber-600">
                {INCIDENT_SEVERITY_HINTS[data.severity]}
              </p>

              <dl className="mb-5 grid grid-cols-1 gap-3 min-[640px]:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Tipo</dt>
                  <dd className="mt-1 font-semibold">{data.type}</dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Fuente</dt>
                  <dd className="mt-1 font-semibold">{data.source}</dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Ubicación en vía</dt>
                  <dd className="mt-1 font-semibold">{data.location}</dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Ruta afectada</dt>
                  <dd className="mt-1 font-semibold">{data.routeName ?? '—'}</dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Sitio de trabajo</dt>
                  <dd className="mt-1 font-semibold">{data.targetWorkSite ?? '—'}</dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Corredor</dt>
                  <dd className="mt-1 font-semibold">{data.zoneLabel ?? '—'}</dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Coordenadas</dt>
                  <dd className="mt-1 font-semibold">
                    {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
                  </dd>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                  <dt className="text-xs text-slate-500">Reportado por</dt>
                  <dd className="mt-1 font-semibold">{data.reportedBy ?? data.assignee ?? '—'}</dd>
                </div>
              </dl>

              <div className="mb-5">
                <h2 className="neo-section-title mb-3">Descripción y recomendación</h2>
                <p className="text-slate-500">{data.description}</p>
              </div>

              <div>
                <h2 className="neo-section-title mb-3">Actualizar estado</h2>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ACTIONS.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={data.status === status ? 'primary' : 'secondary'}
                      disabled={updateStatus.isPending || data.status === status}
                      onClick={() => handleStatusChange(status)}
                    >
                      {INCIDENT_STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              <Card padding="lg">
                <h2 className="neo-section-title mb-3">Línea de tiempo</h2>
                <IncidentTimeline events={[...data.timeline].reverse()} />
              </Card>

              <Card padding="lg">
                <h2 className="neo-section-title mb-3">Observación para personal</h2>
                <Textarea
                  label="Comentario"
                  name="comment"
                  value={comment}
                  onChange={setComment}
                  rows={4}
                  placeholder="Instrucción o actualización visible en seguimiento..."
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!comment.trim() || addComment.isPending}
                    onClick={handleAddComment}
                  >
                    {addComment.isPending ? 'Guardando...' : 'Publicar observación'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </section>
  )
}
