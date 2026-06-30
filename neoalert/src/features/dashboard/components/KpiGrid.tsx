import { KpiCard } from '@shared/components/data-display/KpiCard'
import type { DashboardKpi } from '../types/dashboard.types'

interface KpiGridProps {
  kpis: DashboardKpi[]
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1400px]:grid-cols-6"
      role="list"
    >
      {kpis.map((kpi) => (
        <div key={kpi.id} role="listitem">
          <KpiCard
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            trend={kpi.trend}
            variant={kpi.variant}
          />
        </div>
      ))}
    </div>
  )
}
