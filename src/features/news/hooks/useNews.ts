import { useQuery } from '@tanstack/react-query'
import type { NewsFilters } from '../types/news.types'
import { fetchNews, fetchNewsDataset } from '../services/news.api'

export function useNewsDataset() {
  return useQuery({
    queryKey: ['news', 'dataset'],
    queryFn: fetchNewsDataset,
    staleTime: 1000 * 60 * 30,
  })
}

export function useNews(filters: NewsFilters = {}) {
  return useQuery({
    queryKey: ['news', 'list', filters],
    queryFn: () => fetchNews(filters),
    staleTime: 1000 * 60 * 5,
  })
}
