import type { MapRisksSummary } from '@shared/types/map.types'
import { Card } from '@shared/components/ui/Card'
import { AlertTriangle, Layers, ShieldAlert } from 'lucide-react'

interface HeatmapStatsPanelProps {
  summary: MapRisksSummary
}

const SEVERITY_ITEMS = [
  { key: 'critical' as const, label: 'Crítico', color: 'text-red-600', bar: 'bg-red-500' },
  { key: 'high' as const, label: 'Alto', color: 'text-orange-600', bar: 'bg-orange-500' },
  { key: 'medium' as const, label: 'Medio', color: 'text-amber-600', bar: 'bg-amber-500' },
  { key: 'low' as const, label: 'Bajo', color: 'text-blue-600', bar: 'bg-blue-500' },
]

export function HeatmapStatsPanel({ summary }: HeatmapStatsPanelProps) {
  const maxSeverity = Math.max(
    summary.bySeverity.critical,
    summary.bySeverity.high,
    summary.bySeverity.medium,
    summary.bySeverity.low,
    1,
  )

  return (
    <div className="flex flex-col gap-3">
      <Card padding="md" className="border-amber-100 bg-gradient-to-br from-amber-50/80 to-white">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Zonas de riesgo activas</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Condiciones identificadas por administradores y supervisores
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-amber-700">{summary.total}</p>
          </div>
        </div>
      </Card>

      <Card padding="md">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-slate-900">Riesgo por nivel</h3>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {SEVERITY_ITEMS.map((item) => {
            const count = summary.bySeverity[item.key]
            const width = `${Math.round((count / maxSeverity) * 100)}%`
            return (
              <li key={item.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <strong className={item.color}>{count}</strong>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${item.bar}`} style={{ width }} />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card padding="md">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="size-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Por municipio</h3>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {summary.byMunicipality.map((municipality) => (
            <li
              key={municipality.municipalityId}
              className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-sm"
            >
              <span className="text-slate-600">{municipality.municipalityLabel}</span>
              <strong className="tabular-nums">{municipality.count}</strong>
            </li>
          ))}
        </ul>
      </Card>

      <p className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs leading-relaxed text-slate-500">
        El mapa de calor muestra la concentración de riesgos territoriales. Los incidentes se
        registran cuando el personal confirma que el riesgo se materializó.
      </p>
    </div>
  )
}
