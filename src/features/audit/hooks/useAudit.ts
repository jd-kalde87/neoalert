import { useMutation, useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import type { AuditListFilters } from '../types/audit.types'
import {
  exportAuditLogs,
  fetchAuditById,
  fetchAuditLogs,
  fetchAuditSummary,
} from '../services/audit.api'

export function useAuditLogs(localFilters: AuditListFilters = {}) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['audit', 'list', globalFilters, localFilters],
    queryFn: () => fetchAuditLogs(globalFilters, localFilters),
  })
}

export function useAuditSummary(localFilters: AuditListFilters = {}) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['audit', 'summary', globalFilters, localFilters],
    queryFn: () => fetchAuditSummary(globalFilters, localFilters),
  })
}

export function useAuditDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['audit', 'detail', id],
    queryFn: () => fetchAuditById(id!),
    enabled: Boolean(id),
  })
}

export function useExportAuditLogs(localFilters: AuditListFilters = {}) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useMutation({
    mutationFn: () => exportAuditLogs(globalFilters, localFilters),
  })
}
