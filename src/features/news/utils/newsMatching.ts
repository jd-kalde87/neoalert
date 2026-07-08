import { DEPARTMENT_OPTIONS, MUNICIPALITY_OPTIONS, PROJECT_OPTIONS } from '@shared/constants/filter-options'
import { PROJECT_DEPARTMENT_KEYS } from '@shared/constants/territory-catalog.generated'
import { normalizeTerritoryKey, territoryKeysMatch } from '@shared/utils/territoryMatch'
import type { NewsFilters, NewsItem, RegionalNewsContext } from '../types/news.types'

export function getDepartmentLabel(departmentId?: string): string | undefined {
  return DEPARTMENT_OPTIONS.find((item) => item.value === departmentId)?.label
}

export function getMunicipalityLabel(municipalityId?: string): string | undefined {
  return MUNICIPALITY_OPTIONS.find((item) => item.value === municipalityId)?.label
}

export function getProjectLabel(projectId?: string): string | undefined {
  return PROJECT_OPTIONS.find((item) => item.value === projectId)?.label
}

export function buildRegionalContext(input: {
  countryCode?: string
  departmentId?: string
  municipalityId?: string
  projectId?: string
}): RegionalNewsContext {
  return {
    countryCode: input.countryCode,
    departmentId: input.departmentId,
    departmentLabel: getDepartmentLabel(input.departmentId),
    municipalityId: input.municipalityId,
    municipalityLabel: getMunicipalityLabel(input.municipalityId),
    projectId: input.projectId,
    projectLabel: getProjectLabel(input.projectId),
  }
}

export function newsMatchesRegion(item: NewsItem, context: RegionalNewsContext): boolean {
  if (context.countryCode && context.countryCode !== 'CO') {
    return false
  }

  if (context.municipalityLabel) {
    return territoryKeysMatch(item.municipalityKey, normalizeTerritoryKey(context.municipalityLabel))
  }

  if (context.departmentLabel) {
    return territoryKeysMatch(item.departmentKey, normalizeTerritoryKey(context.departmentLabel))
  }

  if (context.projectId) {
    const hints = PROJECT_DEPARTMENT_KEYS[context.projectId] ?? []
    return hints.some((hint) => territoryKeysMatch(item.departmentKey, hint))
  }

  return context.countryCode === 'CO'
}

export function filterNewsItems(items: NewsItem[], filters: NewsFilters): NewsItem[] {
  return items.filter((item) => {
    if (filters.departmentKey && item.departmentKey !== filters.departmentKey) return false
    if (filters.municipalityKey && item.municipalityKey !== filters.municipalityKey) return false
    if (filters.severity && filters.severity !== 'all' && item.severity !== filters.severity) {
      return false
    }
    if (filters.dateFrom && item.date && item.date < filters.dateFrom) return false
    if (filters.dateTo && item.date && item.date > filters.dateTo) return false
    if (filters.search) {
      const query = normalizeTerritoryKey(filters.search)
      const haystack = normalizeTerritoryKey(
        `${item.activity} ${item.department} ${item.municipality} ${item.country}`,
      )
      if (!haystack.includes(query)) return false
    }
    return true
  })
}

export function getRegionalNews(
  items: NewsItem[],
  context: RegionalNewsContext,
  options?: { limit?: number; recentDays?: number },
): NewsItem[] {
  const limit = options?.limit ?? 8
  const recentDays = options?.recentDays
  const cutoffIso = recentDays
    ? (() => {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - recentDays)
        return cutoff.toISOString().slice(0, 10)
      })()
    : null

  return items
    .filter((item) => newsMatchesRegion(item, context))
    .filter((item) => !cutoffIso || !item.date || item.date >= cutoffIso)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, limit)
}

export function getRegionalAlertKey(context: RegionalNewsContext): string {
  return [
    context.countryCode ?? 'all',
    context.projectId ?? 'all',
    context.departmentId ?? 'all',
    context.municipalityId ?? 'all',
  ].join(':')
}
