export function HeatmapRiskLegend() {
  const items = [
    { color: '#22c55e', label: 'Riesgo bajo' },
    { color: '#eab308', label: 'Riesgo medio' },
    { color: '#f97316', label: 'Riesgo alto' },
    { color: '#b91c1c', label: 'Riesgo crítico' },
  ]

  return (
    <div
      className="pointer-events-none absolute bottom-4 left-4 z-[500] max-w-[calc(100%-2rem)] rounded-xl border border-slate-200/80 bg-white/95 px-3 py-3 shadow-panel backdrop-blur-sm"
      aria-label="Leyenda de mapa de calor por riesgo"
    >
      <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
        Concentración por nivel de riesgo
      </p>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-[0.6875rem] text-slate-700">
            <span
              className="inline-block size-3 shrink-0 rounded-full border border-white shadow-sm"
              style={{ background: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.625rem] leading-relaxed text-slate-500">
        Todos los incidentes importados contribuyen al mapa de calor.
      </p>
    </div>
  )
}
