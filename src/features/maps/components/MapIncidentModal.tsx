import { Modal } from '@shared/components/ui/Modal'
import { IncidentForm } from '@features/incidents/components/IncidentForm'
import { useCreateIncident } from '@features/incidents/hooks/useIncidents'
import type { CreateIncidentFormValues } from '@features/incidents/types/incident.schema'
import { MapPin } from 'lucide-react'

interface MapIncidentModalProps {
  open: boolean
  latitude: number | null
  longitude: number | null
  onClose: () => void
  onCreated?: (incidentId: string) => void
}

export function MapIncidentModal({
  open,
  latitude,
  longitude,
  onClose,
  onCreated,
}: MapIncidentModalProps) {
  const createIncident = useCreateIncident()

  const handleSubmit = async (values: CreateIncidentFormValues) => {
    const incident = await createIncident.mutateAsync({
      title: values.title,
      description: values.description,
      type: values.type,
      severity: values.severity,
      source: values.source,
      location: values.location,
      latitude: values.latitude,
      longitude: values.longitude,
      blocksTransit: values.blocksTransit,
      routeName: values.routeName,
      projectId: values.projectId,
      departmentId: values.departmentId,
      municipalityId: values.municipalityId,
      sectorId: values.sectorId,
      reportedBy: values.reportedBy,
    })
    onCreated?.(incident.id)
    onClose()
  }

  const hasLocation = latitude != null && longitude != null

  return (
    <Modal
      open={open && hasLocation}
      onClose={onClose}
      title="Registrar incidente (riesgo materializado)"
      description="Complete el formulario. La ubicación se tomó del punto seleccionado en el mapa."
      size="xl"
    >
      {hasLocation ? (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2 text-sm text-brand-900">
            <MapPin className="size-4 shrink-0" />
            <span className="tabular-nums">
              Ubicación: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </span>
          </div>
          <IncidentForm
            key={`${latitude}-${longitude}`}
            onSubmit={handleSubmit}
            isSubmitting={createIncident.isPending}
            initialLocation={{ latitude, longitude }}
            showLocationPicker={false}
            compact
          />
        </>
      ) : null}
    </Modal>
  )
}
