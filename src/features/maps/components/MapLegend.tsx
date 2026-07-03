export function MapLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? 'flex flex-wrap gap-x-4 gap-y-1.5 text-[0.6875rem] text-slate-500'
          : 'grid grid-cols-1 gap-2 sm:grid-cols-3'
      }
      aria-label="Leyenda del mapa"
    >
      <span className="inline-flex items-center gap-2">
        <i className="inline-block size-2.5 shrink-0 rounded-full bg-brand-900" />
        Proyecto
      </span>
      <span className="inline-flex items-center gap-2">
        <i className="inline-block size-2.5 shrink-0 rounded-full bg-emerald-600" />
        Departamento
      </span>
      <span className="inline-flex items-center gap-2">
        <i className="inline-block size-2.5 shrink-0 rounded-full border-2 border-amber-500 bg-red-600" />
        Zona de riesgo
      </span>
    </div>
  )
}
