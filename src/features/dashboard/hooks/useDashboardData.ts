import { useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import { fetchDashboardSummary } from '../services/dashboard.api'

export function useDashboardData() {
  const filters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['dashboard', 'summary', filters],
    queryFn: () => fetchDashboardSummary(filters),
  })
}
