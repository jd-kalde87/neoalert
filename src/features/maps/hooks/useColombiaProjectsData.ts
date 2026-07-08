import { useQuery } from '@tanstack/react-query'
import {
  COLOMBIA_PROJECTS_AREAS_URL,
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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`)
  }
  return response.json() as Promise<T>
}

export function useColombiaProjectsData(enabled: boolean) {
  return useQuery({
    queryKey: ['maps', 'colombia-projects'],
    enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    queryFn: async () => {
      const [areas, municipios, centers] = await Promise.all([
        fetchJson(COLOMBIA_PROJECTS_AREAS_URL),
        fetchJson(COLOMBIA_PROJECTS_MUNICIPIOS_URL),
        fetchJson<ColombiaProjectCenter[]>(COLOMBIA_PROJECTS_CENTERS_URL),
      ])
      return { areas, municipios, centers }
    },
  })
}
