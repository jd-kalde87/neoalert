import type { CreateIncidentDto, IncidentSeverity } from '@features/incidents/types/incident.types'
import { bulkCreateIncidentsFromImport } from '@features/incidents/services/incidents.api'
import { SEED_ROUTES, SEED_WORK_SITES } from '@shared/constants/operations'
import { geocodeLocation, parseCoordinate } from '@shared/services/geocoding/geocode'
import type { ImportColumnMapping, ImportRowError, ImportTemplateSummary } from '../types/import.types'
import {
  getCanonicalImportValue,
  shouldPublishImportAsIncidents,
} from './resolveImportField'

const SEVERITY_ALIASES: Record<string, IncidentSeverity> = {
  low: 'low',
  bajo: 'low',
  medio: 'medium',
  medium: 'medium',
  alto: 'high',
  high: 'high',
  critico: 'critical',
  crítico: 'critical',
  critical: 'critical',
}

const HIGH_RISK_KEYWORDS = /explosiv|artefacto|armado|enfrentamiento|bloqueo|secuestro|homicidio/i
const CRITICAL_KEYWORDS = /neutralizaci|inhabilitaci|ied|minas|cartel/i

function normalizeSeverity(raw: string, type: string, description: string): IncidentSeverity {
  const key = raw.trim().toLowerCase()
  if (SEVERITY_ALIASES[key]) return SEVERITY_ALIASES[key]

  const count = Number.parseInt(raw, 10)
  if (Number.isFinite(count)) {
    if (count >= 50) return 'critical'
    if (count >= 15) return 'high'
    if (count >= 5) return 'medium'
    return 'low'
  }

  const context = `${type} ${description}`
  if (CRITICAL_KEYWORDS.test(context)) return 'critical'
  if (HIGH_RISK_KEYWORDS.test(context)) return 'high'
  return 'medium'
}

function parseBlocksTransit(type: string, description: string): boolean {
  return /bloqueo|cierre|intransitable|carretera cerrada/i.test(`${type} ${description}`)
}

function resolveZoneFromRoute(routeName: string) {
  const route = SEED_ROUTES.find(
    (item) => item.name.toLowerCase() === routeName.toLowerCase(),
  )
  if (!route) return { zoneId: undefined, siteId: undefined, zoneLabel: undefined }

  const site = SEED_WORK_SITES.find((item) => item.id === route.workSiteId)
  const zoneLabels: Record<string, string> = {
    'zone-norte': 'Corredor Norte',
    'zone-centro': 'Corredor Central',
    'zone-sur': 'Corredor Sur',
    'zone-oriente': 'Corredor Oriental',
  }
  return {
    zoneId: site?.zoneId,
    siteId: site?.id,
    zoneLabel: site?.zoneId ? zoneLabels[site.zoneId] : undefined,
  }
}

function buildDescription(parts: string[]): string {
  return parts.filter(Boolean).join(' · ')
}

async function rowToIncident(
  row: string[],
  headers: string[],
  mappings: ImportColumnMapping[],
  reportedBy: string,
): Promise<{ incident: CreateIncidentDto | null; error: ImportRowError | null }> {
  const location = getCanonicalImportValue(row, headers, mappings, 'location')
  const type = getCanonicalImportValue(row, headers, mappings, 'type')
  const forces = getCanonicalImportValue(row, headers, mappings, 'forces')
  const detail = getCanonicalImportValue(row, headers, mappings, 'description')
  const authority = getCanonicalImportValue(row, headers, mappings, 'authority')
  const artifactCount = getCanonicalImportValue(row, headers, mappings, 'artifactCount')
  const sourceField = getCanonicalImportValue(row, headers, mappings, 'source')
  const severityRaw = getCanonicalImportValue(row, headers, mappings, 'severity') || artifactCount
  const routeName = getCanonicalImportValue(row, headers, mappings, 'routeName')

  const title =
    getCanonicalImportValue(row, headers, mappings, 'title') ||
    (type && location ? `${type} — ${location}` : type || location)

  if (!location && !title) {
    return {
      incident: null,
      error: {
        row: 0,
        field: 'location',
        message: 'Fila sin ubicación ni título reconocible',
      },
    }
  }

  const latRaw = getCanonicalImportValue(row, headers, mappings, 'latitude')
  const lngRaw = getCanonicalImportValue(row, headers, mappings, 'longitude')

  let latitude = parseCoordinate(latRaw)
  let longitude = parseCoordinate(lngRaw)

  const geocodeQuery = location || title

  if (latitude === null || longitude === null) {
    const geocoded = await geocodeLocation(geocodeQuery)
    if (!geocoded) {
      return {
        incident: null,
        error: {
          row: 0,
          field: 'location',
          message: `No se pudo ubicar «${geocodeQuery}» en el mapa`,
        },
      }
    }
    latitude = geocoded.lat
    longitude = geocoded.lng
  }

  const description = buildDescription([
    detail,
    forces ? `Fuerzas: ${forces}` : '',
    artifactCount ? `Artefactos/insumos: ${artifactCount}` : '',
    authority ? `Autoridad: ${authority}` : '',
  ])

  const zone = resolveZoneFromRoute(routeName)

  return {
    incident: {
      title,
      description: description || `Registro importado en ${location || geocodeQuery}`,
      type: type || 'Operativo de seguridad',
      severity: normalizeSeverity(severityRaw, type, description),
      source: sourceField || 'Importación masiva',
      location: location || geocodeQuery,
      latitude,
      longitude,
      blocksTransit: parseBlocksTransit(type, description),
      routeName: routeName || undefined,
      targetWorkSite: zone.siteId
        ? SEED_WORK_SITES.find((s) => s.id === zone.siteId)?.name
        : undefined,
      zoneId: zone.zoneId ?? 'zone-imported',
      zoneLabel: zone.zoneLabel ?? 'Zona importada',
      siteId: zone.siteId,
      reportedBy,
    },
    error: null,
  }
}

export interface PublishImportResult {
  created: number
  errors: ImportRowError[]
}

export async function publishSecurityIncidentRows(
  payload: {
    headers: string[]
    rows: string[][]
    mappings: ImportColumnMapping[]
  },
  template: ImportTemplateSummary,
  reportedBy: string,
): Promise<PublishImportResult> {
  if (!shouldPublishImportAsIncidents(template.entity, payload.mappings)) {
    return { created: 0, errors: [] }
  }

  const incidents: CreateIncidentDto[] = []
  const errors: ImportRowError[] = []

  for (let index = 0; index < payload.rows.length; index += 1) {
    const row = payload.rows[index]!
    const rowNum = index + 2
    const { incident, error } = await rowToIncident(
      row,
      payload.headers,
      payload.mappings,
      reportedBy,
    )

    if (error) {
      errors.push({ ...error, row: rowNum })
      continue
    }

    if (incident) {
      incidents.push(incident)
    }
  }

  if (incidents.length > 0) {
    await bulkCreateIncidentsFromImport(incidents)
  }

  return { created: incidents.length, errors }
}
