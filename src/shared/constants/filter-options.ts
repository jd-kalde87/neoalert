import { MUNICIPALITY_GEO } from './geo.constants'

export interface FilterOption {
  value: string
  label: string
}

export const TENANT_OPTIONS: FilterOption[] = [
  { value: 'tenant-co', label: 'NeoAlert Colombia' },
  { value: 'tenant-mx', label: 'NeoAlert México' },
  { value: 'tenant-pe', label: 'NeoAlert Perú' },
]

export const MUNICIPALITY_OPTIONS: FilterOption[] = MUNICIPALITY_GEO.map((item) => ({
  value: item.value,
  label: item.label,
}))

export const DEPARTMENT_OPTIONS: FilterOption[] = [
  { value: 'dept-narino', label: 'Nariño' },
  { value: 'dept-valle', label: 'Valle del Cauca' },
  { value: 'dept-caldas', label: 'Caldas' },
  { value: 'dept-antioquia', label: 'Antioquia' },
]

export const PROJECT_OPTIONS: FilterOption[] = [
  { value: 'project-ipiales', label: 'Proyecto Ipiales' },
  { value: 'project-cali', label: 'Proyecto Cali' },
  { value: 'project-manizales', label: 'Proyecto Manizales' },
  { value: 'project-medellin', label: 'Proyecto Medellín' },
]

export const COUNTRY_OPTIONS: FilterOption[] = [
  { value: 'CO', label: 'Colombia' },
  { value: 'MX', label: 'México' },
  { value: 'PE', label: 'Perú' },
]

export const SECTOR_OPTIONS: FilterOption[] = [
  { value: 'sector-km10', label: 'Kilómetro 10' },
  { value: 'sector-km7', label: 'Kilómetro 7' },
  { value: 'sector-antena12', label: 'Antena 12' },
  { value: 'sector-km20', label: 'Kilómetro 20' },
  { value: 'sector-pr2003', label: 'PR 2003' },
  { value: 'sector-pr3200', label: 'PR 3200' },
]

export const EVENT_TYPE_OPTIONS: FilterOption[] = [
  { value: 'bloqueo', label: 'Bloqueos viales' },
  { value: 'armado', label: 'Riesgo armado' },
  { value: 'altercado', label: 'Altercados' },
  { value: 'restriccion', label: 'Restricciones de acceso' },
  { value: 'inundacion', label: 'Inundación / derrumbe' },
  { value: 'robo', label: 'Robo / hurto' },
]

export const ZONE_OPTIONS = MUNICIPALITY_OPTIONS
export const SITE_OPTIONS = DEPARTMENT_OPTIONS
export const CREW_OPTIONS = SECTOR_OPTIONS

export function getDefaultDateRange() {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  return {
    dateFrom: weekAgo.toISOString().slice(0, 10),
    dateTo: today.toISOString().slice(0, 10),
  }
}
