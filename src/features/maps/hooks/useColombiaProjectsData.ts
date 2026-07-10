import { useQuery } from '@tanstack/react-query'
import {
  COLOMBIA_PROJECTS_CENTERS_URL,
  COLOMBIA_PROJECTS_MUNICIPIOS_URL,
} from '@shared/constants/colombia-map.constants'

export interface ColombiaProjectCenter {
  noProyect: string
  nombre: string
  empresa: string
  segmento: string
  gerente: string
  tipo: string
  color: string
  latitude: number
  longitude: number
  municipios: number
}

export function useColombiaProjectsData(enabled: boolean) {
  return useQuery({
    queryKey: ['maps', 'colombia-projects-points'],
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    queryFn: async () => {
      const [municipiosResponse, centersResponse] = await Promise.all([
        fetch(COLOMBIA_PROJECTS_MUNICIPIOS_URL),
        fetch(COLOMBIA_PROJECTS_CENTERS_URL),
      ])

      if (!municipiosResponse.ok || !centersResponse.ok) {
        throw new Error('No se pudieron cargar los proyectos WSP')
      }

      const [municipios, centers] = await Promise.all([
        municipiosResponse.json(),
        centersResponse.json() as Promise<ColombiaProjectCenter[]>,
      ])

      return { municipios, centers }
    },
  })
}
