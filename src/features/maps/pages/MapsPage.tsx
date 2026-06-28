import { useOutletContext } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
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
    <div>
      <PageHeader
        title="Mapa de rutas y riesgos"
        description="Rutas planta → sitios de trabajo. Bloqueos, altercados y riesgos que impiden o dificultan el desplazamiento del personal."
      />

      <MapViewNav />
      <IncidentListPanel
        incidents={incidents}
        selectedIncidentId={selectedIncidentId}
        onSelect={(id) => selectIncident(id)}
      />
      {layerMode === 'heatmap' ? (
        <p className="mt-3 text-[0.8125rem] text-slate-500">
          Vista heatmap activa en el mapa.
        </p>
      ) : null}
    </div>
  )
}

export function HeatmapPage() {
  const { summary } = useOutletContext<MapsOutletContext>()

  return (
    <div>
      <PageHeader
        title="Mapa de calor — riesgos"
        description="Densidad de incidentes de seguridad por corredor y nivel de riesgo."
      />

      <MapViewNav />

      {summary ? (
        <HeatmapStatsPanel summary={summary} />
      ) : (
        <p className="text-slate-500">Sin datos de densidad para mostrar.</p>
      )}
    </div>
  )
}
