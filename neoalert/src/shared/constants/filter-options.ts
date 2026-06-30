export interface FilterOption {
  value: string
  label: string
}

export const TENANT_OPTIONS: FilterOption[] = [
  { value: 'tenant-co', label: 'NeoAlert Colombia' },
  { value: 'tenant-mx', label: 'NeoAlert México' },
  { value: 'tenant-pe', label: 'NeoAlert Perú' },
]

export const ZONE_OPTIONS: FilterOption[] = [
  { value: 'zone-norte', label: 'Corredor Norte' },
  { value: 'zone-centro', label: 'Corredor Central' },
  { value: 'zone-sur', label: 'Corredor Sur' },
  { value: 'zone-oriente', label: 'Corredor Oriental' },
]

export const SITE_OPTIONS: FilterOption[] = [
  { value: 'site-alpha', label: 'Sitio Alpha — Campo Norte' },
  { value: 'site-beta', label: 'Sitio Beta — Corredor Central' },
  { value: 'site-gamma', label: 'Sitio Gamma — Sector Sur' },
  { value: 'site-delta', label: 'Sitio Delta — Vía Oriental' },
]

export const COUNTRY_OPTIONS: FilterOption[] = [
  { value: 'CO', label: 'Colombia' },
  { value: 'MX', label: 'México' },
  { value: 'PE', label: 'Perú' },
]

export const CREW_OPTIONS: FilterOption[] = [
  { value: 'crew-alpha', label: 'Convoy Alpha' },
  { value: 'crew-beta', label: 'Convoy Beta' },
  { value: 'crew-gamma', label: 'Convoy Gamma' },
]

export const EVENT_TYPE_OPTIONS: FilterOption[] = [
  { value: 'bloqueo', label: 'Bloqueos viales' },
  { value: 'armado', label: 'Riesgo armado' },
  { value: 'altercado', label: 'Altercados' },
  { value: 'restriccion', label: 'Restricciones de acceso' },
]

export function getDefaultDateRange() {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  return {
    dateFrom: weekAgo.toISOString().slice(0, 10),
    dateTo: today.toISOString().slice(0, 10),
  }
}
