import type { MapIncident } from '@shared/types/map.types'
import { Badge } from '@shared/components/ui/Badge'
import { cn } from '@shared/utils/cn'

const SEVERITY_VARIANT = {
  low: 'info',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
} as const

const RISK_LABELS = {
  low: 'Riesgo bajo',
  medium: 'Riesgo medio',
  high: 'Riesgo alto',
  critical: 'Riesgo crítico',
} as const

interface IncidentListPanelProps {
  incidents: MapIncident[]
  selectedIncidentId: string | null
  onSelect: (id: string) => void
}

export function IncidentListPanel({
  incidents,
  selectedIncidentId,
  onSelect,
}: IncidentListPanelProps) {
  if (incidents.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
        No hay incidentes de seguridad en las rutas para los filtros seleccionados.
      </p>
    )
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {incidents.map((incident) => (
        <li key={incident.id}>
          <button
            type="button"
            className={cn(
              'w-full cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md',
              selectedIncidentId === incident.id && 'border-accent/50 bg-accent-soft/40 ring-2 ring-accent/15',
            )}
            onClick={() => onSelect(incident.id)}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <strong className="text-sm leading-snug text-slate-900">{incident.title}</strong>
              <Badge variant={SEVERITY_VARIANT[incident.severity]} className="shrink-0">
                {RISK_LABELS[incident.severity]}
              </Badge>
            </div>
            <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
              {incident.description}
            </p>
            <small className="block text-xs leading-relaxed text-slate-500">
              {incident.routeName ?? incident.zoneLabel}
              {incident.blocksTransit ? ' · No transitar' : ' · Precaución'}
            </small>
          </button>
        </li>
      ))}
    </ul>
  )
}
