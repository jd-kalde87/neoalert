import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import type { NotificationFilters } from '../types/notification.types'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications.api'

export function useNotifications(localFilters: NotificationFilters = {}) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['notifications', 'list', globalFilters, localFilters],
    queryFn: () => fetchNotifications(globalFilters, localFilters),
    refetchInterval: 30_000,
  })
}

export function useUnreadNotificationCount() {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['notifications', 'unread-count', globalFilters],
    queryFn: () => fetchUnreadCount(globalFilters),
    refetchInterval: 15_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
