import type { GlobalFilters } from '@shared/types/common.types'

const LEGACY_ZONE_TO_MUNICIPALITY: Record<string, string> = {
  'zone-norte': 'muni-ipiales',
  'zone-centro': 'muni-cali',
  'zone-sur': 'muni-manizales',
  'zone-oriente': 'muni-medellin',
}

const LEGACY_SITE_TO_DEPARTMENT: Record<string, string> = {
  'site-alpha': 'dept-narino',
  'site-beta': 'dept-valle',
  'site-gamma': 'dept-caldas',
  'site-delta': 'dept-antioquia',
  'dept-alpha': 'dept-narino',
  'dept-beta': 'dept-valle',
  'dept-gamma': 'dept-caldas',
  'dept-delta': 'dept-antioquia',
}

const LEGACY_CREW_TO_SECTOR: Record<string, string> = {
  'crew-alpha': 'sector-km10',
  'crew-beta': 'sector-km7',
  'crew-gamma': 'sector-antena12',
  'sector-alpha': 'sector-km10',
  'sector-beta': 'sector-km7',
  'sector-gamma': 'sector-antena12',
}

export function resolveMunicipalityId(zoneOrMunicipalityId?: string) {
  if (!zoneOrMunicipalityId) return undefined
  return LEGACY_ZONE_TO_MUNICIPALITY[zoneOrMunicipalityId] ?? zoneOrMunicipalityId
}

export function resolveDepartmentId(siteOrDepartmentId?: string) {
  if (!siteOrDepartmentId) return undefined
  return LEGACY_SITE_TO_DEPARTMENT[siteOrDepartmentId] ?? siteOrDepartmentId
}

export function resolveSectorId(crewOrSectorId?: string) {
  if (!crewOrSectorId) return undefined
  return LEGACY_CREW_TO_SECTOR[crewOrSectorId] ?? crewOrSectorId
}

export function matchesTerritoryFilters(
  entity: {
    zoneId?: string
    municipalityId?: string
    siteId?: string
    departmentId?: string
    crewId?: string
    sectorId?: string
  },
  filters: GlobalFilters,
) {
  if (filters.municipalityId) {
    const entityMunicipality =
      entity.municipalityId ?? resolveMunicipalityId(entity.zoneId)
    if (entityMunicipality && entityMunicipality !== filters.municipalityId) return false
  }

  if (filters.departmentId) {
    const entityDepartment = entity.departmentId ?? resolveDepartmentId(entity.siteId)
    if (entityDepartment && entityDepartment !== filters.departmentId) return false
  }

  if (filters.sectorId) {
    const entitySector = entity.sectorId ?? resolveSectorId(entity.crewId)
    if (entitySector && entitySector !== filters.sectorId) return false
  }

  if (filters.projectId && 'projectId' in entity && entity.projectId) {
    if (entity.projectId !== filters.projectId) return false
  }

  return true
}
