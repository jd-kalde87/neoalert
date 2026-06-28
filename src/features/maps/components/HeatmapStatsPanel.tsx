import type { MapIncidentsSummary } from '@shared/types/map.types'
import { Card } from '@shared/components/ui/Card'

interface HeatmapStatsPanelProps {
  summary: MapIncidentsSummary
}

export function HeatmapStatsPanel({ summary }: HeatmapStatsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <Card padding="md">
        <h3 className="mb-3 text-[0.9375rem] font-semibold">Riesgo por nivel</h3>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          <li className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-500">Crítico</span>
            <strong>{summary.bySeverity.critical}</strong>
          </li>
          <li className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-500">Alto</span>
            <strong>{summary.bySeverity.high}</strong>
          </li>
          <li className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-500">Medio</span>
            <strong>{summary.bySeverity.medium}</strong>
          </li>
          <li className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-500">Bajo</span>
            <strong>{summary.bySeverity.low}</strong>
          </li>
        </ul>
      </Card>

      <Card padding="md">
        <h3 className="mb-3 text-[0.9375rem] font-semibold">Rutas bloqueadas</h3>
        <p className="text-3xl font-bold text-red-600">{summary.blockingRoutes}</p>
        <p className="mt-1 text-[0.8125rem] text-slate-500">
          Incidentes que impiden el desplazamiento del personal
        </p>
      </Card>

      <Card padding="md">
        <h3 className="mb-3 text-[0.9375rem] font-semibold">Por corredor</h3>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {summary.byZone.map((zone) => (
            <li key={zone.zoneId} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-500">{zone.zoneLabel}</span>
              <strong>{zone.count}</strong>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-[0.8125rem] text-slate-500">
        El mapa de calor refleja puntos de riesgo en vías hacia los sitios de trabajo. Los
        colaboradores verán estos datos en la app móvil.
      </p>
    </div>
  )
}
