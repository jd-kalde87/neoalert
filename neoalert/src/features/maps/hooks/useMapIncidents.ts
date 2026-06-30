import { useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import { fetchMapIncidents } from '../services/maps.api'

export function useMapIncidents() {
  const filters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['maps', 'incidents', filters],
    queryFn: () => fetchMapIncidents(filters),
  })
}
