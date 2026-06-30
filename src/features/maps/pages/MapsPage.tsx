import { useOutletContext } from 'react-router-dom'
import type { MapIncident, MapIncidentsSummary } from '@shared/types/map.types'
import { HeatmapStatsPanel } from '../components/HeatmapStatsPanel'
import { IncidentListPanel } from '../components/IncidentListPanel'

interface MapsOutletContext {
  incidents: MapIncident[]
  summary?: MapIncidentsSummary
  selectedIncidentId: string | null
  selectIncident: (id: string | null) => void
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
    </header>
  )
}

export function MapsPage() {
  const { incidents, selectedIncidentId, selectIncident } =
    useOutletContext<MapsOutletContext>()

  return (
    <div className="flex flex-col gap-4">
      <PanelHeader
        title="Incidentes en ruta"
        description="Seleccione un incidente en la lista o en el mapa. Use clic en el mapa para registrar uno nuevo."
      />
      <IncidentListPanel
        incidents={incidents}
        selectedIncidentId={selectedIncidentId}
        onSelect={(id) => selectIncident(id)}
      />
    </div>
  )
}

export function HeatmapPage() {
  const { summary } = useOutletContext<MapsOutletContext>()

  return (
    <div className="flex flex-col gap-4">
      <PanelHeader
        title="Densidad de riesgos"
        description="Concentración de incidentes por nivel de riesgo y corredores operativos planta → sitios."
      />

      {summary ? (
        <HeatmapStatsPanel summary={summary} />
      ) : (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Sin datos de densidad para los filtros seleccionados.
        </p>
      )}
    </div>
  )
}
