import { useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import { fetchMapRisks } from '../services/risks.api'

export function useMapRisks() {
  const filters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['maps', 'risks', filters],
    queryFn: () => fetchMapRisks(filters),
  })
}
