import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@shared/components/ui/Modal'
import { MapPin } from 'lucide-react'
import { createRiskFromMap } from '../services/risks.api'
import type { CreateRiskFormValues } from '../types/risk.schema'
import { RiskForm } from './RiskForm'

interface MapRiskModalProps {
  open: boolean
  latitude: number | null
  longitude: number | null
  onClose: () => void
  onCreated?: (riskId: string) => void
}

export function MapRiskModal({
  open,
  latitude,
  longitude,
  onClose,
  onCreated,
}: MapRiskModalProps) {
  const queryClient = useQueryClient()
  const createRisk = useMutation({
    mutationFn: createRiskFromMap,
    onSuccess: (risk) => {
      void queryClient.invalidateQueries({ queryKey: ['maps', 'risks'] })
      onCreated?.(risk.id)
      onClose()
    },
  })

  const handleSubmit = async (values: CreateRiskFormValues) => {
    await createRisk.mutateAsync({
      title: values.title,
      description: values.description,
      type: values.type,
      severity: values.severity,
      latitude: values.latitude,
      longitude: values.longitude,
      municipalityId: values.municipalityId,
      departmentId: values.departmentId,
      projectId: values.projectId,
      sectorId: values.sectorId,
      source: values.source,
      reportedBy: values.reportedBy,
    })
  }

  const hasLocation = latitude != null && longitude != null

  return (
    <Modal
      open={open && hasLocation}
      onClose={onClose}
      title="Registrar zona de riesgo"
      description="Complete el formulario. La ubicación se tomó del punto seleccionado en el mapa de riesgos."
      size="xl"
    >
      {hasLocation ? (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-950">
            <MapPin className="size-4 shrink-0" />
            <span className="tabular-nums">
              Ubicación: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </span>
          </div>
          <RiskForm
            key={`${latitude}-${longitude}`}
            onSubmit={handleSubmit}
            isSubmitting={createRisk.isPending}
            initialLocation={{ latitude, longitude }}
            compact
          />
        </>
      ) : null}
    </Modal>
  )
}
