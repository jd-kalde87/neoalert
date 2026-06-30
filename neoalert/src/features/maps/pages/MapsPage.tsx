import { useOutletContext } from 'react-router-dom'
import type { MapIncident, MapIncidentsSummary } from '@shared/types/map.types'
import { HeatmapStatsPanel } from '../components/HeatmapStatsPanel'
import { IncidentListPanel } from '../components/IncidentListPanel'
import { MapViewNav } from '../components/MapViewNav'
import { useMapStore } from '../stores/mapStore'

interface MapsOutletContext {
  incidents: MapIncident[]
  summary?: MapIncidentsSummary
  selectedIncidentId: string | null
  selectIncident: (id: string | null) => void
}

export function MapsPage() {
  const { incidents, selectedIncidentId, selectIncident } =
    useOutletContext<MapsOutletContext>()
  const layerMode = useMapStore((state) => state.layerMode)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="mb-4 shrink-0 space-y-4">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Mapa de rutas y riesgos
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Rutas planta → sitios de trabajo. Bloqueos, altercados y riesgos que impiden o
            dificultan el desplazamiento del personal.
          </p>
        </div>
        <MapViewNav />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <IncidentListPanel
          incidents={incidents}
          selectedIncidentId={selectedIncidentId}
          onSelect={(id) => selectIncident(id)}
        />
        {layerMode === 'heatmap' ? (
          <p className="mt-4 text-sm text-slate-500">Vista heatmap activa en el mapa.</p>
        ) : null}
      </div>
    </div>
  )
}

export function HeatmapPage() {
  const { summary } = useOutletContext<MapsOutletContext>()

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="mb-4 shrink-0 space-y-4">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Mapa de calor — riesgos
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            Densidad de incidentes de seguridad por corredor y nivel de riesgo.
          </p>
        </div>
        <MapViewNav />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {summary ? (
          <HeatmapStatsPanel summary={summary} />
        ) : (
          <p className="text-sm text-slate-500">Sin datos de densidad para mostrar.</p>
        )}
      </div>
    </div>
  )
}
