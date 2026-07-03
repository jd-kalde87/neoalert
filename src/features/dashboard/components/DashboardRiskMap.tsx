import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { OperativeMap } from '@shared/components/maps/OperativeMap'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { ROUTES } from '@shared/constants/routes'
import { useMapRisks } from '@features/risks/hooks/useMapRisks'
import { useMapStore } from '@features/maps/stores/mapStore'
import { COLOMBIA_THEMATIC_LAYERS } from '@shared/constants/colombia-map.constants'
import { cn } from '@shared/utils/cn'

interface DashboardRiskMapProps {
  activeRisks: number
  municipalitiesMonitored: number
  sectorsOnField: number
}

export function DashboardRiskMap({
  activeRisks,
  municipalitiesMonitored,
  sectorsOnField,
}: DashboardRiskMapProps) {
  const { data, isLoading, isError, refetch } = useMapRisks()
  const layerMode = useMapStore((state) => state.layerMode)
  const selectedRiskId = useMapStore((state) => state.selectedRiskId)
  const setLayerMode = useMapStore((state) => state.setLayerMode)
  const selectRisk = useMapStore((state) => state.selectRisk)
  const colombiaOverlay = useMapStore((state) => state.colombiaOverlay)
  const setColombiaOverlay = useMapStore((state) => state.setColombiaOverlay)

  const risks = data?.risks ?? []

  return (
    <Card padding="none" className="flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Mapa de riesgos</h2>
            <p className="text-xs text-slate-500">Vista global — use filtros para acercar al país o proyecto</p>
          </div>
        </div>
        <Link to={ROUTES.maps}>
          <Button size="sm" variant="secondary">
            Abrir mapa
          </Button>
        </Link>
      </div>

      <div className="relative min-h-[280px] flex-1">
        <div className="absolute top-2 right-2 z-[600] flex flex-wrap gap-1">
          {(
            [
              ['none', 'Sin capa'] as const,
              ['department-risk', COLOMBIA_THEMATIC_LAYERS['department-risk'].shortLabel] as const,
              ['armed-groups', COLOMBIA_THEMATIC_LAYERS['armed-groups'].shortLabel] as const,
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cn(
                'rounded border px-2 py-0.5 text-[0.625rem] font-semibold shadow-sm',
                colombiaOverlay === value
                  ? 'border-brand-700 bg-brand-900 text-white'
                  : 'border-slate-200 bg-white/95 text-slate-600',
              )}
              onClick={() => setColombiaOverlay(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          loadingTitle="Cargando riesgos"
          errorTitle="No se pudo cargar el mapa"
          onRetry={() => refetch()}
        >
          <OperativeMap
            risks={risks}
            layerMode={layerMode}
            selectedRiskId={selectedRiskId}
            onLayerChange={setLayerMode}
            onSelectRisk={selectRisk}
            compact
            enableViewportSync
          />
        </AsyncBoundary>
      </div>

      <div className="grid grid-cols-3 gap-px border-t border-slate-200 bg-slate-200 text-center text-xs">
        <div className="bg-white px-3 py-2.5">
          <p className="font-bold tabular-nums text-amber-700">{activeRisks}</p>
          <p className="text-slate-500">Riesgos activos</p>
        </div>
        <div className="bg-white px-3 py-2.5">
          <p className="font-bold tabular-nums text-slate-800">{municipalitiesMonitored}</p>
          <p className="text-slate-500">Municipios</p>
        </div>
        <div className="bg-white px-3 py-2.5">
          <p className="font-bold tabular-nums text-slate-800">{sectorsOnField}</p>
          <p className="text-slate-500">Sectores</p>
        </div>
      </div>
    </Card>
  )
}
