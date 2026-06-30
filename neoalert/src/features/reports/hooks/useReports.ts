import { useMutation, useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import type { ExportFormat, ReportType } from '../types/report.types'
import { exportReport, fetchReport } from '../services/reports.api'

export function useReport(type: ReportType | undefined) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['reports', type, globalFilters],
    queryFn: () => fetchReport(type!, globalFilters),
    enabled: Boolean(type),
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ type, format }: { type: ReportType; format: ExportFormat }) =>
      exportReport(type, format),
  })
}
