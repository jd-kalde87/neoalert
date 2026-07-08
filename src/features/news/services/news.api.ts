import type { NewsDataset, NewsFilters } from '../types/news.types'
import { filterNewsItems } from '../utils/newsMatching'

const NEWS_DATA_URL = '/data/noticias-interes.json'

let cachedDataset: NewsDataset | null = null

export async function fetchNewsDataset(): Promise<NewsDataset> {
  if (cachedDataset) return cachedDataset

  const response = await fetch(NEWS_DATA_URL)
  if (!response.ok) {
    throw new Error('No se pudieron cargar las noticias de interés')
  }

  cachedDataset = (await response.json()) as NewsDataset
  return cachedDataset
}

export async function fetchNews(filters: NewsFilters = {}) {
  const dataset = await fetchNewsDataset()
  const items = filterNewsItems(dataset.items, filters)
  return {
    ...dataset,
    items,
    filteredTotal: items.length,
  }
}

export function getNewsDepartments(items: NewsDataset['items']) {
  const map = new Map<string, string>()
  for (const item of items) {
    if (item.departmentKey) {
      map.set(item.departmentKey, item.department)
    }
  }
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
}
