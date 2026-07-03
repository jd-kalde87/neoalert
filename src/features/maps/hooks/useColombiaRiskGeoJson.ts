import { useQuery } from '@tanstack/react-query'
import { COLOMBIA_RISK_GEOJSON_URL } from '@shared/constants/colombia-map.constants'

export function useColombiaRiskGeoJson(enabled: boolean) {
  return useQuery({
    queryKey: ['maps', 'colombia-risk-geojson'],
    queryFn: async () => {
      const response = await fetch(COLOMBIA_RISK_GEOJSON_URL)
      if (!response.ok) {
        throw new Error('No se pudo cargar el mapa de riesgo territorial')
      }
      return response.json()
    },
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
