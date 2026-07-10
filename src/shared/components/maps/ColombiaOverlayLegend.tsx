import {
  COLOMBIA_THEMATIC_LAYERS,
  DEPARTMENT_RISK_LEGEND,
} from '@shared/constants/colombia-map.constants'
import { cn } from '@shared/utils/cn'

interface ColombiaOverlayLegendProps {
  className?: string
}

export function ColombiaOverlayLegend({ className }: ColombiaOverlayLegendProps) {
  const config = COLOMBIA_THEMATIC_LAYERS['department-risk']

  return (
    <div
      className={cn(
        'pointer-events-none max-w-[220px] rounded-lg border border-slate-200 bg-white/95 p-3 text-[0.6875rem] shadow-md backdrop-blur-sm',
        className,
      )}
      aria-label={`Leyenda: ${config.label}`}
    >
      <p className="mb-1 font-bold text-slate-900">{config.label}</p>
      <p className="mb-2 leading-snug text-slate-500">{config.description}</p>
      <ul className="m-0 grid list-none gap-1 p-0">
        {DEPARTMENT_RISK_LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block size-3 shrink-0 rounded-sm border border-slate-300/60"
              style={{ background: item.color }}
            />
            <span className="text-slate-700">{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-slate-100 pt-2 text-[0.625rem] text-slate-400">
        Fuente: {config.source}
      </p>
    </div>
  )
}
