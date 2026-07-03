import { useOutletContext } from 'react-router-dom'
import type { MapRisk, MapRisksSummary } from '@shared/types/map.types'
import { HeatmapStatsPanel } from '../components/HeatmapStatsPanel'
import { RiskListPanel } from '../components/RiskListPanel'

interface MapsOutletContext {
  risks: MapRisk[]
  summary?: MapRisksSummary
  selectedRiskId: string | null
  selectRisk: (id: string | null) => void
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
  const { risks, selectedRiskId, selectRisk } = useOutletContext<MapsOutletContext>()

  return (
    <div className="flex flex-col gap-4">
      <PanelHeader
        title="Riesgos actuales"
        description="Seleccione una zona en la lista o en el mapa. Use clic en el mapa para registrar un nuevo riesgo."
      />
      <RiskListPanel
        risks={risks}
        selectedRiskId={selectedRiskId}
        onSelect={(id) => selectRisk(id)}
      />
    </div>
  )
}

export function HeatmapPage() {
  const { summary } = useOutletContext<MapsOutletContext>()

  return (
    <div className="flex flex-col gap-4">
      <PanelHeader
        title="Mapa de calor de riesgos"
        description="Densidad de zonas de riesgo por nivel y municipio según los filtros globales."
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
