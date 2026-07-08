import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { getNewsDepartments } from '../services/news.api'
import { useNews, useNewsDataset } from '../hooks/useNews'
import { NewsFiltersBar } from '../components/NewsFiltersBar'
import { NewsList } from '../components/NewsList'
import type { NewsFilters } from '../types/news.types'
import { normalizeTerritoryKey } from '@shared/utils/territoryMatch'

export function NewsInterestPage() {
  const [searchParams] = useSearchParams()
  const initialDepartment = searchParams.get('department') ?? undefined

  const [filters, setFilters] = useState<NewsFilters>({
    departmentKey: initialDepartment ? normalizeTerritoryKey(initialDepartment) : undefined,
    severity: 'all',
  })

  const { data: dataset } = useNewsDataset()
  const { data, isLoading, isError, refetch } = useNews(filters)

  const departmentOptions = useMemo(
    () => (dataset ? getNewsDepartments(dataset.items) : []),
    [dataset],
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Noticias de Interés"
        description="Historial de eventos de orden público y seguridad territorial. Las alertas emergentes se cruzan con su filtro de país, proyecto, departamento o municipio."
      />

      <Card className="space-y-4">
        <NewsFiltersBar
          filters={filters}
          departmentOptions={departmentOptions}
          onChange={setFilters}
        />
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-sm text-slate-600">
            {data?.filteredTotal ?? 0} noticia(s)
            {dataset ? ` · Fuente: ${dataset.source}` : ''}
          </p>
        </div>

        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          loadingTitle="Cargando noticias"
          errorTitle="No se pudieron cargar las noticias"
          onRetry={() => refetch()}
        >
          <NewsList items={data?.items ?? []} />
        </AsyncBoundary>
      </Card>
    </div>
  )
}
