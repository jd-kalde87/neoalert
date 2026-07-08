import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'
import { ROUTES } from '@shared/constants/routes'
import { useFilterStore } from '@shared/stores/filterStore'
import { useNewsDataset } from '../hooks/useNews'
import { useNewsAlertsStore } from '../stores/newsAlertsStore'
import {
  buildRegionalContext,
  getRegionalAlertKey,
  getRegionalNews,
} from '../utils/newsMatching'
import { NewsList } from './NewsList'

function getRegionLabel(context: ReturnType<typeof buildRegionalContext>): string {
  if (context.municipalityLabel) {
    return `${context.municipalityLabel}, ${context.departmentLabel ?? 'Colombia'}`
  }
  if (context.departmentLabel) return context.departmentLabel
  if (context.projectLabel) return context.projectLabel
  if (context.countryCode === 'CO') return 'Colombia'
  return 'su zona'
}

export function RegionalNewsAlert() {
  const filters = useFilterStore((state) => state.filters)
  const { data } = useNewsDataset()
  const dismissedRegionalKeys = useNewsAlertsStore((state) => state.dismissedRegionalKeys)
  const dismissRegional = useNewsAlertsStore((state) => state.dismissRegional)
  const [open, setOpen] = useState(false)

  const context = useMemo(
    () =>
      buildRegionalContext({
        countryCode: filters.countryCode,
        departmentId: filters.departmentId,
        municipalityId: filters.municipalityId,
        projectId: filters.projectId,
      }),
    [filters.countryCode, filters.departmentId, filters.municipalityId, filters.projectId],
  )

  const regionalNews = useMemo(() => {
    if (!data?.items) return []
    const hasTerritory =
      Boolean(context.departmentLabel) ||
      Boolean(context.municipalityLabel) ||
      Boolean(context.projectId)
    if (!hasTerritory) return []
    return getRegionalNews(data.items, context, { limit: 5, recentDays: 365 })
  }, [data?.items, context])

  const alertKey = useMemo(() => {
    if (regionalNews.length === 0) return null
    const latest = regionalNews[0]?.date ?? 'na'
    return `${getRegionalAlertKey(context)}:${latest}`
  }, [context, regionalNews])

  const isDismissed = alertKey ? dismissedRegionalKeys.includes(alertKey) : true

  useEffect(() => {
    if (regionalNews.length > 0 && alertKey && !isDismissed) {
      setOpen(true)
      return
    }
    if (regionalNews.length === 0) {
      setOpen(false)
    }
  }, [regionalNews.length, alertKey, isDismissed, context.projectId, context.departmentId, context.municipalityId])

  if (!open || regionalNews.length === 0 || !alertKey) return null

  const criticalCount = regionalNews.filter((item) => item.severity === 'critical').length
  const regionLabel = getRegionLabel(context)

  return (
    <Modal
      open={open}
      onClose={() => {
        dismissRegional(alertKey)
        setOpen(false)
      }}
      title="Noticias de interés en su zona"
      description={`Eventos de orden público recientes relacionados con ${regionLabel}. Revise antes de operar en el territorio.`}
      size="lg"
    >
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p className="m-0">
          {regionalNews.length} noticia(s) coinciden con su filtro territorial
          {criticalCount > 0 ? ` · ${criticalCount} de severidad crítica` : ''}.
        </p>
      </div>

      <NewsList items={regionalNews} compact />

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            dismissRegional(alertKey)
            setOpen(false)
          }}
        >
          Entendido
        </Button>
        <Link to={ROUTES.newsInterest} className="no-underline" onClick={() => setOpen(false)}>
          <Button>Ver historial completo</Button>
        </Link>
      </div>
    </Modal>
  )
}
