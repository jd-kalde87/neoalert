import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { OperativeMap } from '@shared/components/maps/OperativeMap'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { MapIncidentModal } from '@features/maps/components/MapIncidentModal'
import { useMapRisks } from '@features/risks/hooks/useMapRisks'
import { useMapStore } from '@features/maps/stores/mapStore'
import { ROUTES } from '@shared/constants/routes'
import { AlertTriangle } from 'lucide-react'

/** Registro visual: clic en el mapa → modal con datos del incidente materializado. */
export function IncidentCreatePage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useMapRisks()
  const layerMode = useMapStore((state) => state.layerMode)
  const selectedRiskId = useMapStore((state) => state.selectedRiskId)
  const setLayerMode = useMapStore((state) => state.setLayerMode)
  const selectRisk = useMapStore((state) => state.selectRisk)

  const [modalOpen, setModalOpen] = useState(false)
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null)

  const risks = data?.risks ?? []

  const handleMapClick = (lat: number, lng: number) => {
    setDraftLocation({ lat, lng })
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setDraftLocation(null)
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col gap-3">
      <PageHeader
        title="Registrar incidente (riesgo materializado)"
        description="Las zonas de riesgo aparecen en el mapa. Haga clic donde se materializó el incidente para abrir el formulario."
        actions={
          <>
            <Link to={ROUTES.maps}>
              <Button variant="secondary" size="sm">
                Mapa de riesgos
              </Button>
            </Link>
            <Link to={ROUTES.incidents}>
              <Button variant="secondary" size="sm">
                Volver al listado
              </Button>
            </Link>
          </>
        }
      />

      <div className="relative min-h-[min(70vh,640px)] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          loadingTitle="Cargando mapa"
          errorTitle="No se pudo cargar el mapa"
          onRetry={() => refetch()}
        >
          <OperativeMap
            risks={risks}
            layerMode={layerMode}
            selectedRiskId={selectedRiskId}
            onLayerChange={setLayerMode}
            onSelectRisk={selectRisk}
            onRegisterIncidentAt={handleMapClick}
            draftMarker={
              draftLocation
                ? { latitude: draftLocation.lat, longitude: draftLocation.lng }
                : null
            }
          />
        </AsyncBoundary>

        <div className="pointer-events-none absolute top-3 left-3 z-[500] flex max-w-sm items-start gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>
            Los marcadores con borde ámbar son <strong>riesgos preventivos</strong>. El clic registra
            un <strong>incidente confirmado</strong> en ese punto.
          </span>
        </div>
      </div>

      <MapIncidentModal
        open={modalOpen}
        latitude={draftLocation?.lat ?? null}
        longitude={draftLocation?.lng ?? null}
        onClose={handleModalClose}
        onCreated={(incidentId) => navigate(`/incidents/${incidentId}`)}
      />
    </section>
  )
}
