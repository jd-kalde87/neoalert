import { Link } from 'react-router-dom'
import type { NotificationItem, NotificationType } from '../types/notification.types'
import type { AlertSeverity } from '@shared/types/alert.types'
import { Badge } from '@shared/components/ui/Badge'
import { NOTIFICATION_TYPE_LABELS } from '../types/notification.types'
import { cn } from '@shared/utils/cn'

const SEVERITY_VARIANT: Record<
  AlertSeverity,
  'default' | 'info' | 'warning' | 'danger'
> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

interface NotificationListProps {
  notifications: NotificationItem[]
  compact?: boolean
  onMarkRead?: (id: string) => void
}

export function NotificationList({
  notifications,
  compact = false,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <p className="p-8 text-center text-slate-500">
        No hay notificaciones para los filtros seleccionados.
      </p>
    )
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={cn(
            'rounded-xl border border-slate-200 bg-slate-50/50 p-4',
            !notification.read && 'border-accent/35 bg-brand-50',
            compact && 'p-3',
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <Badge variant={SEVERITY_VARIANT[notification.severity]}>
              {SEVERITY_LABEL[notification.severity]}
            </Badge>
            <time className="text-xs text-slate-500" dateTime={notification.timestamp}>
              {formatDate(notification.timestamp)}
            </time>
          </div>

          <strong className="mb-1.5 block">{notification.title}</strong>
          <p
            className={cn(
              'mb-2 text-sm text-slate-500',
              compact && 'line-clamp-2',
            )}
          >
            {notification.message}
          </p>

          <div className="mb-2.5 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>{NOTIFICATION_TYPE_LABELS[notification.type as NotificationType]}</span>
            {notification.blocksTransit ? (
              <span className="font-bold text-red-600">No transitar</span>
            ) : null}
          </div>

          <div className={cn('flex flex-wrap gap-3 text-[0.8125rem]', compact && 'mt-1')}>
            {notification.incidentId ? (
              <Link
                to={`/incidents/${notification.incidentId}`}
                onClick={() => onMarkRead?.(notification.id)}
                className="font-semibold no-underline hover:underline"
              >
                Ver incidente
              </Link>
            ) : null}
            {!notification.read && onMarkRead ? (
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent p-0 font-semibold text-accent"
                onClick={() => onMarkRead(notification.id)}
              >
                Marcar leída
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
