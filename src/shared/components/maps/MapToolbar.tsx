import type { ColombiaThematicOverlay, MapLayerMode } from '@shared/types/map.types'
import { COLOMBIA_THEMATIC_LAYERS } from '@shared/constants/colombia-map.constants'
import { cn } from '@shared/utils/cn'

interface MapToolbarProps {
  layerMode: MapLayerMode
  onLayerChange: (mode: MapLayerMode) => void
  colombiaOverlay: ColombiaThematicOverlay
  onColombiaOverlayChange: (overlay: ColombiaThematicOverlay) => void
  riskCount: number
  showColombiaLayers?: boolean
}

const LAYER_OPTIONS: { value: MapLayerMode; label: string }[] = [
  { value: 'standard', label: 'Estándar' },
  { value: 'satellite', label: 'Satélite' },
  { value: 'operational', label: 'Operativa' },
  { value: 'heatmap', label: 'Calor (puntos)' },
]

const COLOMBIA_OVERLAY_OPTIONS: {
  value: ColombiaThematicOverlay
  label: string
}[] = [
  { value: 'none', label: 'Sin capa CO' },
  {
    value: 'department-risk',
    label: COLOMBIA_THEMATIC_LAYERS['department-risk'].shortLabel,
  },
  {
    value: 'armed-groups',
    label: COLOMBIA_THEMATIC_LAYERS['armed-groups'].shortLabel,
  },
]

export function MapToolbar({
  layerMode,
  onLayerChange,
  colombiaOverlay,
  onColombiaOverlayChange,
  riskCount,
  showColombiaLayers = true,
}: MapToolbarProps) {
  return (
    <div
      className="absolute top-3 right-3 left-3 z-[500] flex flex-col gap-2 rounded-md border border-slate-200 bg-white/95 p-2 shadow-panel backdrop-blur-sm max-[768px]:top-2 max-[768px]:right-2 max-[768px]:left-2"
      role="toolbar"
      aria-label="Controles de mapa"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
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
          {riskCount} zona(s) de riesgo
        </span>
      </div>

      {showColombiaLayers ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
          <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-400">
            Capas Colombia
          </span>
          {COLOMBIA_OVERLAY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={
                option.value !== 'none'
                  ? `${COLOMBIA_THEMATIC_LAYERS[option.value].label} (mapa de calor)`
                  : 'Ocultar capa temática'
              }
              className={cn(
                'min-h-7 cursor-pointer rounded-sm border px-2 text-[0.6875rem] font-semibold',
                colombiaOverlay === option.value
                  ? option.value === 'department-risk'
                    ? 'border-orange-400 bg-orange-50 text-orange-900'
                    : option.value === 'armed-groups'
                      ? 'border-red-400 bg-red-50 text-red-900'
                      : 'border-slate-400 bg-slate-100 text-slate-700'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
              onClick={() => onColombiaOverlayChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
