import type { MapLayerMode } from '@shared/types/map.types'
import { cn } from '@shared/utils/cn'

interface MapToolbarProps {
  layerMode: MapLayerMode
  onLayerChange: (mode: MapLayerMode) => void
  incidentCount: number
}

const LAYER_OPTIONS: { value: MapLayerMode; label: string }[] = [
  { value: 'standard', label: 'Estándar' },
  { value: 'satellite', label: 'Satélite' },
  { value: 'operational', label: 'Operativa' },
  { value: 'heatmap', label: 'Calor' },
]

export function MapToolbar({ layerMode, onLayerChange, incidentCount }: MapToolbarProps) {
  return (
    <div
      className="absolute top-3 right-3 left-3 z-[500] flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white/95 p-2 shadow-panel backdrop-blur-sm max-[768px]:top-2 max-[768px]:right-2 max-[768px]:left-2"
      role="toolbar"
      aria-label="Controles de mapa"
    >
      <div className="flex flex-wrap gap-1.5">
        {LAYER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              'min-h-8 cursor-pointer rounded-sm border px-2.5 text-xs font-semibold',
              layerMode === option.value
                ? 'border-accent bg-brand-50 text-blue-700'
                : 'border-slate-200 bg-white',
            )}
            onClick={() => onLayerChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-500">
        {incidentCount} incidentes de seguridad
      </span>
    </div>
  )
}
