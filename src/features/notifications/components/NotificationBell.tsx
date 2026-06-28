import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { ROUTES } from '@shared/constants/routes'
import { Button } from '@shared/components/ui/Button'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications'
import { NotificationList } from './NotificationList'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data: unread = 0 } = useUnreadNotificationCount()
  const { data, isLoading, isError, refetch } = useNotifications({ read: 'unread' })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const recent = data?.slice(0, 5) ?? []

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative inline-flex h-9 w-10 items-center justify-center rounded-md border border-slate-200 bg-white"
        aria-expanded={open}
        aria-label={`Notificaciones${unread > 0 ? `, ${unread} sin leer` : ''}`}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-4 w-4 text-slate-600" aria-hidden="true" />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-red-600 px-1 text-center text-[0.625rem] leading-[18px] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-[1000] w-[min(420px,calc(100vw-2rem))] max-h-[min(70vh,520px)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-elevated"
          role="dialog"
          aria-label="Alertas de seguridad"
        >
          <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
            <div>
              <strong className="block">Alertas de seguridad</strong>
              <p className="mt-0.5 text-[0.8125rem] text-slate-500">{unread} sin leer</p>
            </div>
            {unread > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
              >
                Marcar todas
              </Button>
            ) : null}
          </header>

          <AsyncBoundary
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && recent.length === 0}
            loadingTitle="Cargando alertas"
            errorTitle="Error al cargar"
            emptyTitle="Sin alertas pendientes"
            onRetry={() => refetch()}
          >
            <div className="p-3">
              <NotificationList
                notifications={recent}
                compact
                onMarkRead={(id) => markRead.mutate(id)}
              />
            </div>
          </AsyncBoundary>

          <footer className="border-t border-slate-200 px-4 py-3 text-center text-sm font-semibold">
            <Link to={ROUTES.notifications} onClick={() => setOpen(false)} className="no-underline">
              Ver centro de notificaciones
            </Link>
          </footer>
        </div>
      ) : null}
    </div>
  )
}
