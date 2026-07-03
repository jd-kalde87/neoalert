import type { GlobalFilters } from '@shared/types/common.types'
import type { MapRisk, MapRisksSummary } from '@shared/types/map.types'
import { municipalityLabel } from '@shared/hooks/useOperations'
import { useRisksStore } from '../stores/risksStore'
import type { Risk } from '../types/risk.types'
import { RISK_STATUS_LABELS, type CreateRiskDto } from '../types/risk.types'

function filterRisks(risks: Risk[], filters: GlobalFilters) {
  return risks.filter((risk) => {
    if (filters.countryCode) {
      const projectMatch = !risk.projectId || filters.projectId === risk.projectId
      const dept = risk.departmentId
      if (!projectMatch && !dept) return true
    }
    if (filters.projectId && risk.projectId && risk.projectId !== filters.projectId) return false
    if (filters.departmentId && risk.departmentId && risk.departmentId !== filters.departmentId)
      return false
    if (
      filters.municipalityId &&
      risk.municipalityId &&
      risk.municipalityId !== filters.municipalityId
    )
      return false
    if (filters.sectorId && risk.sectorId && risk.sectorId !== filters.sectorId) return false
    if (filters.eventType && risk.type && !risk.type.toLowerCase().includes(filters.eventType))
      return false
    return true
  })
}

function toMapRisk(risk: Risk): MapRisk {
  return {
    id: risk.id,
    title: risk.title,
    description: risk.description,
    latitude: risk.latitude,
    longitude: risk.longitude,
    severity: risk.severity,
    status: RISK_STATUS_LABELS[risk.status],
    municipalityId: risk.municipalityId ?? 'unknown',
    municipalityLabel:
      risk.municipalityLabel ??
      (risk.municipalityId ? municipalityLabel(risk.municipalityId) : 'Sin municipio'),
    departmentId: risk.departmentId,
    riskType: risk.type,
    reportedAt: risk.createdAt,
  }
}

function buildSummary(risks: MapRisk[]): MapRisksSummary {
  const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 }
  const municipalityMap = new Map<
    string,
    { municipalityId: string; municipalityLabel: string; count: number }
  >()

  risks.forEach((risk) => {
    bySeverity[risk.severity] += 1
    const current = municipalityMap.get(risk.municipalityId) ?? {
      municipalityId: risk.municipalityId,
      municipalityLabel: risk.municipalityLabel,
      count: 0,
    }
    current.count += 1
    municipalityMap.set(risk.municipalityId, current)
  })

  return {
    total: risks.length,
    bySeverity,
    byMunicipality: Array.from(municipalityMap.values()),
  }
}

export async function fetchMapRisks(filters: GlobalFilters) {
  await new Promise((resolve) => setTimeout(resolve, 120))
  const risks = filterRisks(useRisksStore.getState().risks, filters).map(toMapRisk)
  return {
    risks,
    summary: buildSummary(risks),
  }
}

export async function createRiskFromMap(payload: CreateRiskDto) {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return useRisksStore.getState().createRisk(payload)
}

