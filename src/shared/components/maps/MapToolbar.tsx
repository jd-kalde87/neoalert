import type { MapLayerMode } from '@shared/types/map.types'
import { COLOMBIA_PROJECTS_LAYER, COLOMBIA_THEMATIC_LAYERS } from '@shared/constants/colombia-map.constants'
import { cn } from '@shared/utils/cn'

interface MapToolbarProps {
  layerMode: MapLayerMode
  onLayerChange: (mode: MapLayerMode) => void
  showRiskLayer: boolean
  onToggleRiskLayer: () => void
  showProjectsLayer: boolean
  onToggleProjectsLayer: () => void
  riskCount: number
  showColombiaLayers?: boolean
}

const BASE_LAYER_OPTIONS: { value: MapLayerMode; label: string }[] = [
  { value: 'standard', label: 'Estándar' },
  { value: 'satellite', label: 'Satélite' },
]

export function MapToolbar({
  layerMode,
  onLayerChange,
  showRiskLayer,
  onToggleRiskLayer,
  showProjectsLayer,
  onToggleProjectsLayer,
  riskCount,
  showColombiaLayers = true,
}: MapToolbarProps) {
  const activeBaseLayer = layerMode === 'satellite' ? 'satellite' : 'standard'

  return (
    <div
      className="absolute top-3 left-3 z-[500] w-[11.5rem] rounded-lg border border-slate-200 bg-white/95 p-2.5 shadow-md backdrop-blur-sm max-[768px]:top-2 max-[768px]:left-2"
      role="toolbar"
      aria-label="Controles de mapa"
    >
      <p className="mb-1.5 text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">
        Mapa base
      </p>
      <div className="flex flex-wrap gap-1">
        {BASE_LAYER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              'min-h-7 flex-1 cursor-pointer rounded-sm border px-2 text-[0.6875rem] font-semibold',
              layerMode === option.value || activeBaseLayer === option.value
                ? 'border-accent bg-brand-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600',
            )}
            onClick={() => onLayerChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showColombiaLayers ? (
        <>
          <p className="mb-1.5 mt-2.5 text-[0.625rem] font-bold uppercase tracking-wide text-slate-400">
            Capas Colombia
          </p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              title={COLOMBIA_THEMATIC_LAYERS['department-risk'].description}
              className={cn(
                'min-h-7 w-full cursor-pointer rounded-sm border px-2 text-left text-[0.6875rem] font-semibold',
                showRiskLayer
                  ? 'border-orange-400 bg-orange-50 text-orange-900'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
              onClick={onToggleRiskLayer}
            >
              {COLOMBIA_THEMATIC_LAYERS['department-risk'].shortLabel}
            </button>
            <button
              type="button"
              title={COLOMBIA_PROJECTS_LAYER.description}
              className={cn(
                'min-h-7 w-full cursor-pointer rounded-sm border px-2 text-left text-[0.6875rem] font-semibold',
                showProjectsLayer
                  ? 'border-slate-500 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
              onClick={onToggleProjectsLayer}
            >
              {COLOMBIA_PROJECTS_LAYER.shortLabel}
            </button>
          </div>
        </>
      ) : null}

      <p className="mt-2 border-t border-slate-100 pt-2 text-[0.625rem] font-medium text-slate-500">
        {riskCount} zona(s) de riesgo
      </p>
    </div>
  )
}
