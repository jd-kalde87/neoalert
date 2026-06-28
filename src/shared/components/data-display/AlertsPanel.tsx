import type { AlertItem, AlertSeverity } from '@shared/types/alert.types'
import { Badge } from '@shared/components/ui/Badge'
import { Card } from '@shared/components/ui/Card'
import { EmptyState } from '@shared/components/feedback/LoadingState'
import { cn } from '@shared/utils/cn'

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

const SEVERITY_VARIANT: Record<AlertSeverity, 'default' | 'info' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

interface AlertsPanelProps {
  alerts: AlertItem[]
  title?: string
  maxItems?: number
}

export function AlertsPanel({ alerts, title = 'Alertas recientes', maxItems = 5 }: AlertsPanelProps) {
  const visibleAlerts = alerts.slice(0, maxItems)
  const unreadCount = alerts.filter((alert) => !alert.read).length

  return (
    <Card className="flex min-h-full flex-col gap-4" padding="md">
      <header>
        <h2 className="text-base font-bold">{title}</h2>
        <p className="mt-0.5 text-[0.8125rem] text-slate-500">{unreadCount} sin leer</p>
      </header>

      {visibleAlerts.length === 0 ? (
        <EmptyState
          title="Sin alertas"
          description="No hay alertas para los filtros seleccionados."
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {visibleAlerts.map((alert) => (
            <li
              key={alert.id}
              className={cn(
                'flex flex-col gap-1.5 rounded-md border border-slate-200 bg-slate-50/80 p-3',
                !alert.read && 'border-accent/35 bg-brand-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant={SEVERITY_VARIANT[alert.severity]}>
                  {SEVERITY_LABEL[alert.severity]}
                </Badge>
                <time className="text-xs text-slate-500" dateTime={alert.timestamp}>
                  {formatTimestamp(alert.timestamp)}
                </time>
              </div>
              <strong className="text-sm">{alert.title}</strong>
              <p className="text-[0.8125rem] text-slate-500">{alert.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
