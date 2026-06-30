import { useState } from 'react'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { NotificationFiltersBar } from '../components/NotificationFilters'
import { NotificationList } from '../components/NotificationList'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications'
import type { NotificationFilters } from '../types/notification.types'

export function NotificationsPage() {
  const [localFilters, setLocalFilters] = useState<NotificationFilters>({ read: 'all' })
  const { data: unread = 0 } = useUnreadNotificationCount()
  const { data, isLoading, isError, refetch } = useNotifications(localFilters)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <section>
      <PageHeader
        title="Centro de notificaciones"
        description="Alertas de seguridad en rutas operativas. Los colaboradores recibirán estas notificaciones en la app móvil."
        actions={
          unread > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Marcar todas como leídas ({unread})
            </Button>
          ) : null
        }
      />

      <NotificationFiltersBar filters={localFilters} onChange={setLocalFilters} />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && data?.length === 0}
        loadingTitle="Cargando notificaciones"
        errorTitle="No se pudieron cargar las notificaciones"
        emptyTitle="Sin notificaciones"
        emptyDescription="No hay alertas para los filtros seleccionados."
        onRetry={() => refetch()}
      >
        {data && data.length > 0 ? (
          <NotificationList
            notifications={data}
            onMarkRead={(id) => markRead.mutate(id)}
          />
        ) : null}
      </AsyncBoundary>
    </section>
  )
}
