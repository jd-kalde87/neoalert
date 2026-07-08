import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { useFilterStore } from '@shared/stores/filterStore'
import { ROUTES } from '@shared/constants/routes'
import { useNewsDataset } from '../hooks/useNews'
import { buildRegionalContext, getRegionalNews } from '../utils/newsMatching'
import { NewsList } from './NewsList'

export function RegionalNewsPanel() {
  const filters = useFilterStore((state) => state.filters)
  const { data, isLoading } = useNewsDataset()

  const context = buildRegionalContext({
    countryCode: filters.countryCode,
    departmentId: filters.departmentId,
    municipalityId: filters.municipalityId,
    projectId: filters.projectId,
  })

  const hasTerritory =
    Boolean(context.departmentLabel) ||
    Boolean(context.municipalityLabel) ||
    Boolean(context.projectId) ||
    context.countryCode === 'CO'

  const items =
    data?.items && hasTerritory
      ? getRegionalNews(data.items, context, { limit: 4, recentDays: 365 })
      : []

  if (isLoading) {
    return (
      <p className="text-xs text-slate-500">Cargando noticias de la zona...</p>
    )
  }

  if (!hasTerritory) {
    return (
      <p className="text-[0.6875rem] leading-relaxed text-slate-500">
        Seleccione país, proyecto o departamento en los filtros superiores para ver noticias
        relacionadas con el riesgo territorial.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Newspaper className="size-3.5" />
          Noticias en la zona
        </h3>
        <Link
          to={ROUTES.newsInterest}
          className="text-[0.6875rem] font-semibold text-brand-700 no-underline hover:underline"
        >
          Ver todas
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="m-0 text-xs text-slate-500">
          Sin noticias recientes para este territorio en el historial cargado.
        </p>
      ) : (
        <NewsList items={items} compact />
      )}
    </div>
  )
}
