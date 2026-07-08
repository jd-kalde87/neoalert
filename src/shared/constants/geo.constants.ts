export const WORLD_MAP_VIEW = {
  center: [10, -25] as [number, number],
  zoom: 2,
}

export interface CountryGeo {
  center: [number, number]
  zoom: number
  label: string
}

export const COUNTRY_GEO: Record<string, CountryGeo> = {
  CO: { center: [4.57, -75.5], zoom: 6, label: 'Colombia' },
  MX: { center: [23.63, -102.55], zoom: 5, label: 'México' },
  PE: { center: [-9.19, -75.02], zoom: 6, label: 'Perú' },
}

export interface MunicipalityGeo {
  value: string
  label: string
  countryCode: string
  latitude: number
  longitude: number
}

import { TERRITORY_MUNICIPALITIES } from './territory-catalog.generated'

export const MUNICIPALITY_GEO: MunicipalityGeo[] = TERRITORY_MUNICIPALITIES.map((item) => ({
  value: item.id,
  label: item.label,
  countryCode: item.countryCode,
  latitude: item.latitude,
  longitude: item.longitude,
}))
