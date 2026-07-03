import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { Button } from '@shared/components/ui/Button'
import { LocationPickerMap } from '@shared/components/maps/OperationLayers'
import { SECTOR_OPTIONS } from '@shared/constants/filter-options'
import { useFilterStore } from '@shared/stores/filterStore'
import {
  useDepartmentSelectOptions,
  useMunicipalityOptions,
  useProjectOptions,
  useRouteNameOptions,
} from '@shared/hooks/useOperations'
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

const severityOptions = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const typeOptions = SECURITY_INCIDENT_TYPES.map((type) => ({ value: type, label: type }))
const sourceOptions = REPORT_SOURCE_OPTIONS.map((source) => ({ value: source, label: source }))
const sectorOptions = SECTOR_OPTIONS.map((sector) => ({ value: sector.value, label: sector.label }))

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
  const filters = useFilterStore((state) => state.filters)
  const routeOptions = useRouteNameOptions()
  const projectOptions = useProjectOptions(filters.countryCode)
  const departmentOptions = useDepartmentSelectOptions({
    countryCode: filters.countryCode,
    projectId: filters.projectId,
    municipalityId: filters.municipalityId,
  })
  const municipalityOptions = useMunicipalityOptions(filters.countryCode)

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
      source: 'Operador de campo',
      location: '',
      latitude: initialLocation?.latitude,
      longitude: initialLocation?.longitude,
      blocksTransit: false,
      routeName: '',
      projectId: filters.projectId ?? '',
      departmentId: filters.departmentId ?? '',
      municipalityId: filters.municipalityId ?? '',
      sectorId: filters.sectorId ?? '',
      reportedBy: '',
    },
  })

  const typeValue = watch('type')
  const severityValue = watch('severity')
  const sourceValue = watch('source') ?? 'Operador de campo'
  const routeValue = watch('routeName') ?? ''
  const projectValue = watch('projectId') ?? ''
  const departmentValue = watch('departmentId') ?? ''
  const municipalityValue = watch('municipalityId') ?? ''
  const sectorValue = watch('sectorId') ?? ''
  const descriptionValue = watch('description') ?? ''
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
          placeholder="Ej. Bloqueo confirmado en kilómetro 10"
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
        <Select
          label="Proyecto"
          name="projectId"
          placeholder="Seleccionar"
          options={[{ value: '', label: 'Sin asignar' }, ...projectOptions]}
          value={projectValue}
          onChange={(value) => setValue('projectId', value || undefined)}
        />
        <Select
          label="Departamento"
          name="departmentId"
          placeholder="Seleccionar"
          options={[{ value: '', label: 'Sin asignar' }, ...departmentOptions]}
          value={departmentValue}
          onChange={(value) => setValue('departmentId', value || undefined)}
        />
        <Select
          label="Municipio"
          name="municipalityId"
          placeholder="Seleccionar"
          options={[{ value: '', label: 'Sin asignar' }, ...municipalityOptions]}
          value={municipalityValue}
          onChange={(value) => setValue('municipalityId', value || undefined)}
        />
        <Select
          label="Sector"
          name="sectorId"
          placeholder="Seleccionar"
          options={[{ value: '', label: 'Sin asignar' }, ...sectorOptions]}
          value={sectorValue}
          onChange={(value) => setValue('sectorId', value || undefined)}
        />
        <Input
          label="Reportado por (opcional)"
          {...register('reportedBy')}
          error={errors.reportedBy?.message}
        />
        <Select
          label="Ruta afectada (opcional)"
          name="routeName"
          value={routeValue}
          options={[{ value: '', label: 'Sin asignar' }, ...routeOptions]}
          onChange={(value) => setValue('routeName', value || undefined)}
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
            value={descriptionValue}
            onChange={(value) => setValue('description', value, { shouldValidate: true })}
            error={errors.description?.message}
            rows={compact ? 3 : 4}
            placeholder="Detalla el incidente materializado y su impacto operativo..."
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
            zona (visible en app móvil)
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
          {isSubmitting ? 'Publicando...' : 'Publicar incidente materializado'}
        </Button>
      </div>
    </form>
  )
}
