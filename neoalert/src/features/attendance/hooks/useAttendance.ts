import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import { useAuthStore } from '@shared/stores/authStore'
import type { AttendanceListFilters, CreateAttendanceMarkDto } from '../types/attendance.types'
import {
  createAttendanceMark,
  fetchAttendanceRecords,
  validateRouteSafety,
} from '../services/attendance.api'

export function useAttendanceRecords(localFilters: AttendanceListFilters = {}) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['attendance', 'list', globalFilters, localFilters],
    queryFn: () => fetchAttendanceRecords(globalFilters, localFilters),
  })
}

export function useRouteSafetyValidation(routeName: string, targetWorkSite: string) {
  return useQuery({
    queryKey: ['attendance', 'route-safety', routeName, targetWorkSite],
    queryFn: () => validateRouteSafety(routeName, targetWorkSite),
    enabled: Boolean(routeName && targetWorkSite),
  })
}

export function useCreateAttendanceMark() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (payload: CreateAttendanceMarkDto) =>
      createAttendanceMark(payload, {
        id: user?.id ?? 'demo-user',
        name: user?.name ?? 'Operador demo',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}
