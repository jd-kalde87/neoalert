import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@shared/stores/authStore'
import type { StartImportPayload } from '../types/import.types'
import {
  fetchImportJob,
  fetchImportJobs,
  fetchImportTemplate,
  fetchImportTemplates,
  startImportJob,
} from '../services/imports.api'

export function useImportJobs() {
  return useQuery({
    queryKey: ['imports', 'jobs'],
    queryFn: fetchImportJobs,
  })
}

export function useImportJob(id: string | undefined) {
  return useQuery({
    queryKey: ['imports', 'job', id],
    queryFn: () => fetchImportJob(id!),
    enabled: Boolean(id),
  })
}

export function useImportTemplates() {
  return useQuery({
    queryKey: ['imports', 'templates'],
    queryFn: fetchImportTemplates,
  })
}

export function useImportTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['imports', 'template', id],
    queryFn: () => fetchImportTemplate(id!),
    enabled: Boolean(id),
  })
}

export function useStartImport() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: (payload: StartImportPayload) =>
      startImportJob(payload, user?.name ?? 'Usuario NeoAlert'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imports', 'jobs'] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['maps'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
