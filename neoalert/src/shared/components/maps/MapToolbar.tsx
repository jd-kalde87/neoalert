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

      className="relative z-20 shrink-0 border-b border-slate-200 bg-white px-4 py-3.5 shadow-sm"

      role="toolbar"

      aria-label="Controles de mapa"

    >

      <div className="mb-3 flex items-center justify-between gap-3">

        <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">

          Capas del mapa

        </p>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

          {incidentCount} incidente{incidentCount === 1 ? '' : 's'}

        </span>

      </div>



      <div className="flex flex-wrap items-center justify-center gap-2">

        {LAYER_OPTIONS.map((option) => (

          <button

            key={option.value}

            type="button"

            className={cn(

              'shrink-0 cursor-pointer whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-semibold transition-colors',

              layerMode === option.value

                ? 'border-accent bg-accent-soft text-accent shadow-sm'

                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',

            )}

            onClick={() => onLayerChange(option.value)}

          >

            {option.label}

          </button>

        ))}

      </div>

    </div>

  )

}

