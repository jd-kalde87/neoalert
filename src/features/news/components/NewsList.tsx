import { Link } from 'react-router-dom'
import { MapPin, Newspaper } from 'lucide-react'
import type { NewsItem } from '../types/news.types'
import { NewsSeverityBadge } from './NewsSeverityBadge'
import { ROUTES } from '@shared/constants/routes'

function formatNewsDate(value: string | null) {
  if (!value) return 'Sin fecha'
  return new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface NewsListProps {
  items: NewsItem[]
  compact?: boolean
  onSelect?: (item: NewsItem) => void
}

export function NewsList({ items, compact = false, onSelect }: NewsListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No hay noticias para los filtros seleccionados.
      </p>
    )
  }

  return (
    <ul className={`m-0 grid list-none gap-3 p-0${compact ? '' : ''}`}>
      {items.map((item) => (
        <li key={item.id}>
          <article
            className={`rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300${
              onSelect ? ' cursor-pointer' : ''
            }`}
            onClick={() => onSelect?.(item)}
          >
            <div className={`flex flex-col gap-2 ${compact ? 'p-3' : 'p-4'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Newspaper className="size-3.5" />
                  <time dateTime={item.date ?? undefined}>{formatNewsDate(item.date)}</time>
                </div>
                <NewsSeverityBadge severity={item.severity} />
              </div>

              <p className={`m-0 text-slate-900 ${compact ? 'text-sm' : 'text-base'} leading-snug`}>
                {item.activity}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="size-3.5 shrink-0" />
                <span>
                  {item.municipality}, {item.department} · {item.country}
                </span>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

export function NewsListFooterLink() {
  return (
    <Link
      to={ROUTES.newsInterest}
      className="inline-flex text-sm font-semibold text-brand-700 no-underline hover:underline"
    >
      Ver historial completo de noticias
    </Link>
  )
}
