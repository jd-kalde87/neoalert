import type { MapRisk } from '@shared/types/map.types'
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

interface RiskListPanelProps {
  risks: MapRisk[]
  selectedRiskId: string | null
  onSelect: (id: string) => void
}

export function RiskListPanel({ risks, selectedRiskId, onSelect }: RiskListPanelProps) {
  if (risks.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay zonas de riesgo registradas para los filtros seleccionados. Haz clic en el mapa para
        agregar una nueva.
      </p>
    )
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {risks.map((risk) => (
        <li key={risk.id}>
          <button
            type="button"
            className={cn(
              'w-full cursor-pointer rounded-md border border-slate-200 bg-slate-50/80 p-3 text-left',
              selectedRiskId === risk.id && 'border-accent/45 bg-brand-50',
            )}
            onClick={() => onSelect(risk.id)}
          >
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <strong>{risk.title}</strong>
              <Badge variant={SEVERITY_VARIANT[risk.severity]}>
                {RISK_LABELS[risk.severity]}
              </Badge>
            </div>
            <p className="mb-1.5 text-[0.8125rem] text-slate-500">{risk.description}</p>
            <small className="text-slate-500">
              {risk.municipalityLabel}
              {risk.riskType ? ` · ${risk.riskType}` : ''}
            </small>
          </button>
        </li>
      ))}
    </ul>
  )
}
