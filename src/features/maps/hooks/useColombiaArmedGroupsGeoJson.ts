import { useQuery } from '@tanstack/react-query'
import { COLOMBIA_ARMED_GROUPS_GEOJSON_URL } from '@shared/constants/colombia-map.constants'

export function useColombiaArmedGroupsGeoJson(enabled: boolean) {
  return useQuery({
    queryKey: ['maps', 'colombia-armed-groups-geojson'],
    queryFn: async () => {
      const response = await fetch(COLOMBIA_ARMED_GROUPS_GEOJSON_URL)
      if (!response.ok) {
        throw new Error('No se pudo cargar la capa de grupos armados')
      }
      return response.json()
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
