import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { Button } from '@shared/components/ui/Button'
import { LocationPickerMap } from '@shared/components/maps/OperationLayers'
import {
  createIncidentSchema,
  type CreateIncidentFormValues,
} from '../types/incident.schema'
import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_SEVERITY_HINTS,
  REPORT_SOURCE_OPTIONS,
  SECURITY_INCIDENT_TYPES,
} from '../types/incident.types'
import { useRouteNameOptions, useWorkSiteLabelOptions } from '@shared/hooks/useOperations'

const severityOptions = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const typeOptions = SECURITY_INCIDENT_TYPES.map((type) => ({ value: type, label: type }))
const sourceOptions = REPORT_SOURCE_OPTIONS.map((source) => ({ value: source, label: source }))

interface IncidentFormProps {
  onSubmit: (values: CreateIncidentFormValues) => Promise<void>
  isSubmitting?: boolean
  initialLocation?: { latitude: number; longitude: number }
  showLocationPicker?: boolean
  compact?: boolean
}

export function IncidentForm({
  onSubmit,
  isSubmitting = false,
  initialLocation,
  showLocationPicker = true,
  compact = false,
}: IncidentFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const routeOptions = useRouteNameOptions()
  const siteOptions = useWorkSiteLabelOptions().map((site) => ({
    value: site.label,
    label: site.label,
  }))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateIncidentFormValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      severity: 'high',
      source: 'Jefe de área',
      location: '',
      latitude: initialLocation?.latitude,
      longitude: initialLocation?.longitude,
      blocksTransit: false,
      routeName: '',
      targetWorkSite: '',
      reportedBy: '',
    },
  })

  const typeValue = watch('type')
  const severityValue = watch('severity')
  const sourceValue = watch('source')
  const routeValue = watch('routeName') ?? ''
  const siteValue = watch('targetWorkSite') ?? ''
  const blocksTransit = watch('blocksTransit')
  const latitude = watch('latitude')
  const longitude = watch('longitude')

  const handleFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch {
      setSubmitError('No se pudo registrar el incidente de seguridad. Intenta nuevamente.')
    }
  })

  const handleMapPick = (lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true })
    setValue('longitude', lng, { shouldValidate: true })
  }

  return (
    <form className="neo-form-stack" onSubmit={handleFormSubmit}>
      <div
        className={
          compact ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'grid grid-cols-1 gap-4 min-[768px]:grid-cols-2'
        }
      >
        <Input
          label="Título del incidente"
          placeholder="Ej. Bloqueo en vía hacia Sitio Alpha"
          {...register('title')}
          error={errors.title?.message}
        />
        <Select
          label="Tipo de incidente"
          name="type"
          value={typeValue}
          options={typeOptions}
          onChange={(value) => setValue('type', value, { shouldValidate: true })}
          error={errors.type?.message}
        />
        <Select
          label="Nivel de riesgo"
          name="severity"
          value={severityValue}
          options={severityOptions}
          placeholder=""
          onChange={(value) =>
            setValue('severity', value as CreateIncidentFormValues['severity'], {
              shouldValidate: true,
            })
          }
          error={errors.severity?.message}
        />
        {severityValue ? (
          <p className="col-span-full -mt-2 text-[0.8125rem] font-semibold text-amber-600">
            {INCIDENT_SEVERITY_HINTS[severityValue]}
          </p>
        ) : null}
        <Select
          label="Fuente del reporte"
          name="source"
          value={sourceValue}
          options={sourceOptions}
          placeholder=""
          onChange={(value) => setValue('source', value, { shouldValidate: true })}
          error={errors.source?.message}
        />
        <Input
          label="Reportado por (opcional)"
          {...register('reportedBy')}
          error={errors.reportedBy?.message}
        />
        <Select
          label="Ruta afectada"
          name="routeName"
          value={routeValue}
          options={routeOptions}
          onChange={(value) => setValue('routeName', value || undefined)}
        />
        <Select
          label="Sitio de trabajo destino"
          name="targetWorkSite"
          value={siteValue}
          options={siteOptions}
          onChange={(value) => setValue('targetWorkSite', value || undefined)}
        />
        <div className="col-span-full">
          <Input
            label="Ubicación en vía / referencia"
            placeholder="Km, vereda, cruce o punto de referencia"
            {...register('location')}
            error={errors.location?.message}
          />
        </div>
        <div className="col-span-full">
          <Textarea
            label="Descripción y recomendación al personal"
            name="description"
            value={watch('description')}
            onChange={(value) => setValue('description', value, { shouldValidate: true })}
            error={errors.description?.message}
            rows={4}
            placeholder="Detalla el riesgo y si el personal puede o no desplazarse..."
          />
        </div>
        <label className="col-span-full flex cursor-pointer items-start gap-2.5 rounded-md border border-red-500/25 bg-red-50 p-3">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={blocksTransit}
            onChange={(event) => setValue('blocksTransit', event.target.checked)}
          />
          <span className="text-sm">
            <strong>Bloquea el desplazamiento</strong> — el personal no debe transitar por esta
            ruta (visible en app móvil)
          </span>
        </label>
        {showLocationPicker ? (
          <div className="col-span-full">
            <span className="mb-1.5 block text-[0.8125rem] font-semibold">Ubicación en mapa *</span>
            <LocationPickerMap
              latitude={latitude ?? null}
              longitude={longitude ?? null}
              onChange={handleMapPick}
            />
            {errors.latitude?.message || errors.longitude?.message ? (
              <span className="text-sm text-red-600">
                {errors.latitude?.message ?? errors.longitude?.message}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publicando...' : 'Publicar incidente de seguridad'}
        </Button>
      </div>
    </form>
  )
}
