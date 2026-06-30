import type { ImportColumnMapping } from '../types/import.types'

/** Canonical incident fields → template keys or header patterns. */
export const CANONICAL_FIELD_KEYS: Record<string, string[]> = {
  location: ['location', 'A0002'],
  title: ['title', 'A0003'],
  type: ['type', 'A0003'],
  description: ['description', 'A0005', 'A0004', 'A0007'],
  severity: ['severity', 'A0006'],
  source: ['source', 'A0008'],
  reportedAt: ['reportedAt', 'A0001'],
  routeName: ['routeName'],
  latitude: ['latitude'],
  longitude: ['longitude'],
  blocksTransit: ['blocksTransit'],
  artifactCount: ['A0006'],
  authority: ['A0007'],
  forces: ['A0004'],
}

const HEADER_PATTERNS: Record<string, RegExp> = {
  location: /ubicaci|localidad|lugar|direcci|sitio|punto/i,
  title: /tipo de operativo|tipo de actividad|actividad|operativo|titulo|título|asunto/i,
  type: /tipo de operativo|tipo de actividad|tipo|categor/i,
  description: /detalle|resultado|aseguramiento|descripci/i,
  severity: /riesgo|severidad|prioridad|cantidad/i,
  source: /fuente|origen/i,
  reportedAt: /fecha/i,
  forces: /fuerzas|involucrad/i,
  authority: /autoridad|investigaci/i,
  artifactCount: /artefacto|insumo|cantidad/i,
}

function valueFromMapping(
  row: string[],
  headers: string[],
  mapping: ImportColumnMapping,
): string {
  const colIndex = headers.indexOf(mapping.sourceColumn)
  return colIndex >= 0 ? (row[colIndex]?.trim() ?? '') : ''
}

function valueByTargetKey(
  row: string[],
  headers: string[],
  mappings: ImportColumnMapping[],
  targetKey: string,
): string {
  const mapping = mappings.find((item) => item.targetField === targetKey)
  if (!mapping?.sourceColumn) return ''
  return valueFromMapping(row, headers, mapping)
}

export function getCanonicalImportValue(
  row: string[],
  headers: string[],
  mappings: ImportColumnMapping[],
  canonicalField: string,
): string {
  const keys = CANONICAL_FIELD_KEYS[canonicalField] ?? [canonicalField]

  for (const key of keys) {
    const value = valueByTargetKey(row, headers, mappings, key)
    if (value) return value
  }

  const pattern = HEADER_PATTERNS[canonicalField]
  if (pattern) {
    for (const mapping of mappings) {
      if (!mapping.sourceColumn) continue
      if (pattern.test(mapping.sourceColumn)) {
        const value = valueFromMapping(row, headers, mapping)
        if (value) return value
      }
    }
  }

  return ''
}

export function importMappingsIncludeLocation(mappings: ImportColumnMapping[]): boolean {
  return mappings.some((mapping) => {
    if (!mapping.sourceColumn) return false
    if (['location', 'A0002'].includes(mapping.targetField)) return true
    return HEADER_PATTERNS.location?.test(mapping.sourceColumn) ?? false
  })
}

export function shouldPublishImportAsIncidents(
  entity: string,
  mappings: ImportColumnMapping[],
): boolean {
  if (entity === 'security_incidents') return true
  return importMappingsIncludeLocation(mappings)
}
