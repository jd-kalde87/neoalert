import type { ReportSeriesPoint } from '../types/report.types'

interface ReportBarChartProps {
  title: string
  data: ReportSeriesPoint[]
}

export function ReportBarChart({ title, data }: ReportBarChartProps) {
  const max = Math.max(...data.map((point) => point.value), 1)

  return (
    <div>
      <h3 className="mb-3 text-[0.9375rem] font-semibold">{title}</h3>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {data.map((point) => (
          <li key={point.label} className="grid grid-cols-[80px_1fr_36px] items-center gap-2">
            <span className="text-[0.8125rem] text-slate-500">{point.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-900 to-accent"
                style={{ width: `${(point.value / max) * 100}%` }}
              />
            </div>
            <span className="text-right text-[0.8125rem] font-bold">{point.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
