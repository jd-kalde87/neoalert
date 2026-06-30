import { SEED_PLANTS, SEED_ROUTES, SEED_WORK_SITES } from '@shared/constants/operations'

export interface GeoPoint {
  lat: number
  lng: number
}

const cache = new Map<string, GeoPoint | null>()

const PLACE_ALIASES: Record<string, GeoPoint> = {
  alpha: { lat: 4.78, lng: -74.02 },
  beta: { lat: 4.64, lng: -74.09 },
  gamma: { lat: 4.58, lng: -74.15 },
  delta: { lat: 4.62, lng: -73.98 },
  'sitio alpha': { lat: 4.78, lng: -74.02 },
  'sitio beta': { lat: 4.64, lng: -74.09 },
  'sitio gamma': { lat: 4.58, lng: -74.15 },
  'sitio delta': { lat: 4.62, lng: -73.98 },
  'planta central': { lat: 4.695, lng: -74.13 },
  suba: { lat: 4.735, lng: -74.095 },
  mondonedo: { lat: 4.612, lng: -74.128 },
  'corredor norte': { lat: 4.75, lng: -74.07 },
  'corredor sur': { lat: 4.58, lng: -74.15 },
  bogota: { lat: 4.711, lng: -74.072 },
  concordia: { lat: 23.286, lng: -106.065 },
  'concordia sinaloa': { lat: 23.286, lng: -106.065 },
  'la guayanera': { lat: 23.312, lng: -106.142 },
  'poblado la capilla': { lat: 23.265, lng: -106.089 },
  'la capilla': { lat: 23.265, lng: -106.089 },
  'carretera mexico 40': { lat: 23.305, lng: -106.12 },
  'mexico 40': { lat: 23.305, lng: -106.12 },
  sinaloa: { lat: 24.809, lng: -107.394 },
}

function normalizeKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function lookupKnownPlace(query: string): GeoPoint | null {
  const key = normalizeKey(query)
  if (!key) return null

  if (PLACE_ALIASES[key]) {
    return PLACE_ALIASES[key]
  }

  for (const [alias, point] of Object.entries(PLACE_ALIASES)) {
    if (key.includes(alias) || alias.includes(key)) {
      return point
    }
  }

  for (const site of SEED_WORK_SITES) {
    const siteKey = normalizeKey(site.name)
    if (siteKey.includes(key) || key.includes(siteKey)) {
      return { lat: site.latitude, lng: site.longitude }
    }
  }

  for (const route of SEED_ROUTES) {
    const routeKey = normalizeKey(route.name)
    if (routeKey.includes(key) || key.includes(routeKey)) {
      const midpoint = route.coordinates[Math.floor(route.coordinates.length / 2)]
      if (midpoint) {
        return { lat: midpoint[0], lng: midpoint[1] }
      }
    }
  }

  for (const plant of SEED_PLANTS) {
    const plantKey = normalizeKey(plant.name)
    if (plantKey.includes(key) || key.includes(plantKey)) {
      return { lat: plant.latitude, lng: plant.longitude }
    }
  }

  return null
}

function geocodeSuffixes(query: string): string[] {
  const key = normalizeKey(query)
  if (/sinaloa|concordia|guayanera|capilla|mexico 40|mazatlan|culiacan/.test(key)) {
    return ['Sinaloa, Mexico', 'Mexico']
  }
  if (/colombia|bogota|suba|medellin|cali/.test(key)) {
    return ['Colombia']
  }
  return ['Colombia', 'Sinaloa, Mexico', 'Mexico']
}

async function nominatimSearch(query: string): Promise<GeoPoint | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es',
    },
  })

  if (!response.ok) return null

  const results = (await response.json()) as Array<{ lat: string; lon: string }>
  if (!results[0]) return null

  return {
    lat: Number.parseFloat(results[0].lat),
    lng: Number.parseFloat(results[0].lon),
  }
}

export async function geocodeLocation(query: string): Promise<GeoPoint | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const known = lookupKnownPlace(trimmed)
  if (known) return known

  const cacheKey = normalizeKey(trimmed)
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null
  }

  try {
    for (const suffix of geocodeSuffixes(trimmed)) {
      const point = await nominatimSearch(`${trimmed}, ${suffix}`)
      if (point) {
        cache.set(cacheKey, point)
        return point
      }
    }

    const direct = await nominatimSearch(trimmed)
    if (direct) {
      cache.set(cacheKey, direct)
      return direct
    }
  } catch {
    cache.set(cacheKey, null)
    return null
  }

  cache.set(cacheKey, null)
  return null
}

export function parseCoordinate(value: string | undefined): number | null {
  if (!value?.trim()) return null
  const normalized = value.trim().replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}
