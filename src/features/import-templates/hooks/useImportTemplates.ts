import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTemplate,
  fetchTemplateById,
  fetchTemplates,
  updateTemplate,
  type UpsertTemplatePayload,
} from '../services/templates.api'

export function useImportTemplatesList() {
  return useQuery({
    queryKey: ['import-templates'],
    queryFn: fetchTemplates,
  })
}

export function useImportTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['import-templates', id],
    queryFn: () => fetchTemplateById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateImportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertTemplatePayload) => createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] })
      queryClient.invalidateQueries({ queryKey: ['imports', 'templates'] })
    },
  })
}

export function useUpdateImportTemplate(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertTemplatePayload) => updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-templates'] })
      queryClient.invalidateQueries({ queryKey: ['imports', 'templates'] })
    },
  })
}
