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
      <p className="text-sm text-slate-500">
        No hay incidentes de seguridad en las rutas para los filtros seleccionados.
      </p>
    )
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {incidents.map((incident) => (
        <li key={incident.id}>
          <button
            type="button"
            className={cn(
              'w-full cursor-pointer rounded-md border border-slate-200 bg-slate-50/80 p-3 text-left',
              selectedIncidentId === incident.id && 'border-accent/45 bg-brand-50',
            )}
            onClick={() => onSelect(incident.id)}
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <strong>{incident.title}</strong>
              <Badge variant={SEVERITY_VARIANT[incident.severity]}>
                {RISK_LABELS[incident.severity]}
              </Badge>
            </div>
            <p className="mb-1.5 text-[0.8125rem] text-slate-500">{incident.description}</p>
            <small className="text-slate-500">
              {incident.routeName ?? incident.zoneLabel}
              {incident.blocksTransit ? ' · No transitar' : ' · Precaución'}
            </small>
          </button>
        </li>
      ))}
    </ul>
  )
}
