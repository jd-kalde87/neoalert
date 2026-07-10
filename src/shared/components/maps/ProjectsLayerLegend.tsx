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
      <ul className="m-0 grid list-none gap-1.5 p-0 text-slate-700">
        <li className="flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full border border-white bg-[#171717] shadow-sm" />
          Municipio con proyecto WSP
        </li>
      </ul>
      <p className="mt-2 border-t border-slate-100 pt-2 text-[0.625rem] text-slate-400">
        {projectCount} proyectos · sin polígonos de influencia
      </p>
    </div>
  )
}
