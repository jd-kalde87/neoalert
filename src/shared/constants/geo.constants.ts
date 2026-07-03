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

export const MUNICIPALITY_GEO: MunicipalityGeo[] = [
  {
    value: 'muni-ipiales',
    label: 'Ipiales',
    countryCode: 'CO',
    latitude: 0.828,
    longitude: -77.642,
  },
  {
    value: 'muni-cali',
    label: 'Cali',
    countryCode: 'CO',
    latitude: 3.4516,
    longitude: -76.532,
  },
  {
    value: 'muni-manizales',
    label: 'Manizales',
    countryCode: 'CO',
    latitude: 5.0689,
    longitude: -75.5174,
  },
  {
    value: 'muni-medellin',
    label: 'Medellín',
    countryCode: 'CO',
    latitude: 6.2442,
    longitude: -75.5812,
  },
]
