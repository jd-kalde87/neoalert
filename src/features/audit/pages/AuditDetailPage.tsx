import { Link, useParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { AuditChangeList } from '../components/AuditChangeList'
import { AuditOutcomeBadge } from '../components/AuditOutcomeBadge'
import { useAuditDetail } from '../hooks/useAudit'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
} from '../types/audit.types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date(value))
}

export function AuditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useAuditDetail(id)

  return (
    <section>
      <PageHeader
        title="Detalle de auditoría"
        description="Información completa del evento, cambios registrados y contexto técnico."
        actions={
          <Link to={ROUTES.audit}>
            <Button variant="secondary" size="sm">
              Volver al historial
            </Button>
          </Link>
        }
      />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        loadingTitle="Cargando evento"
        errorTitle="Evento no encontrado"
        onRetry={() => refetch()}
      >
        {data ? (
          <div className="flex flex-col gap-4">
            <Card padding="lg">
              <div className="mb-4 flex justify-between gap-4">
                <div>
                  <p className="m-0 text-xs uppercase tracking-wider text-slate-500">
                    {AUDIT_ENTITY_LABELS[data.entity]}
                  </p>
                  <h2 className="my-1 text-lg">{data.entityLabel}</h2>
                  <p className="m-0 text-sm text-slate-500">{data.summary}</p>
                </div>
                <AuditOutcomeBadge outcome={data.outcome} />
              </div>

              <dl className="m-0 grid grid-cols-1 gap-3 min-[900px]:grid-cols-3">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">Fecha y hora</dt>
                  <dd className="m-0 text-sm">{formatDate(data.timestamp)}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">Acción</dt>
                  <dd className="m-0 text-sm">{AUDIT_ACTION_LABELS[data.action]}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">Actor</dt>
                  <dd className="m-0 text-sm">
                    {data.actor}
                    <span className="block text-xs text-slate-500">{data.actorRole}</span>
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">Correo</dt>
                  <dd className="m-0 text-sm">{data.actorEmail}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">ID entidad</dt>
                  <dd className="m-0 text-sm">{data.entityId}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs text-slate-500">ID evento</dt>
                  <dd className="m-0 text-sm">{data.id}</dd>
                </div>
              </dl>
            </Card>

            {data.changes && data.changes.length > 0 ? (
              <Card padding="lg">
                <h3 className="neo-section-title mb-3">Cambios registrados</h3>
                <AuditChangeList changes={data.changes} />
              </Card>
            ) : null}

            <div className="neo-page-grid-2">
              {data.metadata && Object.keys(data.metadata).length > 0 ? (
                <Card padding="lg">
                  <h3 className="neo-section-title mb-3">Metadatos</h3>
                  <dl className="m-0 flex flex-col gap-2">
                    {Object.entries(data.metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <dt className="text-slate-500">{key}</dt>
                        <dd className="m-0 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              ) : null}

              <Card padding="lg">
                <h3 className="neo-section-title mb-3">Contexto técnico</h3>
                <dl className="m-0 flex flex-col gap-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">Dirección IP</dt>
                    <dd className="m-0 text-right">{data.ipAddress ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">Agente</dt>
                    <dd className="m-0 text-right">{data.userAgent ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">Corredor</dt>
                    <dd className="m-0 text-right">{data.zoneId ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">Sitio</dt>
                    <dd className="m-0 text-right">{data.siteId ?? '—'}</dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        ) : null}
      </AsyncBoundary>
    </section>
  )
}
