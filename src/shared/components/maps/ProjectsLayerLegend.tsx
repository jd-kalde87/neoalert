import { COLOMBIA_PROJECTS_LAYER } from '@shared/constants/colombia-map.constants'
import { cn } from '@shared/utils/cn'

interface ProjectsLayerLegendProps {
  projectCount?: number
  className?: string
}

export function ProjectsLayerLegend({ projectCount = 18, className }: ProjectsLayerLegendProps) {
  return (
    <div
      className={cn(
        'pointer-events-none max-w-[220px] rounded-lg border border-slate-200 bg-white/95 p-3 text-[0.6875rem] shadow-md backdrop-blur-sm',
        className,
      )}
      aria-label={`Leyenda: ${COLOMBIA_PROJECTS_LAYER.label}`}
    >
      <p className="mb-1 font-bold text-slate-900">{COLOMBIA_PROJECTS_LAYER.label}</p>
      <p className="mb-2 leading-snug text-slate-500">{COLOMBIA_PROJECTS_LAYER.description}</p>
      <ul className="m-0 grid list-none gap-1.5 p-0 text-slate-700">
        <li className="flex items-center gap-2">
          <span className="inline-flex size-4 items-center justify-center rounded border border-white bg-blue-600 text-[0.5rem] font-bold text-white shadow-sm">
            P
          </span>
          Centro del proyecto
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block size-3 rounded-full border border-white bg-blue-600 shadow-sm" />
          Municipio asociado
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded-sm border border-blue-400/50 bg-blue-500/30" />
          Área de influencia
        </li>
      </ul>
      <p className="mt-2 border-t border-slate-100 pt-2 text-[0.625rem] text-slate-400">
        {projectCount} proyectos · Fuente: {COLOMBIA_PROJECTS_LAYER.source}
      </p>
    </div>
  )
}
