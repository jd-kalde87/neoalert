import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { Button } from '@shared/components/ui/Button'
import { SECTOR_OPTIONS } from '@shared/constants/filter-options'
import { useFilterStore } from '@shared/stores/filterStore'
import {
  useDepartmentSelectOptions,
  useMunicipalityOptions,
  useProjectOptions,
} from '@shared/hooks/useOperations'
import { createRiskSchema, type CreateRiskFormValues } from '../types/risk.schema'
import {
  REPORT_SOURCE_OPTIONS,
  RISK_SEVERITY_HINTS,
  RISK_SEVERITY_LABELS,
  RISK_TYPES,
} from '../types/risk.types'

const severityOptions = Object.entries(RISK_SEVERITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const typeOptions = RISK_TYPES.map((type) => ({ value: type, label: type }))
const sourceOptions = REPORT_SOURCE_OPTIONS.map((source) => ({ value: source, label: source }))
const sectorOptions = SECTOR_OPTIONS.map((sector) => ({ value: sector.value, label: sector.label }))

interface RiskFormProps {
  onSubmit: (values: CreateRiskFormValues) => Promise<void>
  isSubmitting?: boolean
  initialLocation?: { latitude: number; longitude: number }
  compact?: boolean
}

export function RiskForm({
  onSubmit,
  isSubmitting = false,
  initialLocation,
  compact = false,
}: RiskFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const filters = useFilterStore((state) => state.filters)
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
  } = useForm<CreateRiskFormValues>({
    resolver: zodResolver(createRiskSchema),
    defaultValues: {
      title: '',
      description: '',
      type: '',
      severity: 'high',
      source: 'Supervisor',
      latitude: initialLocation?.latitude,
      longitude: initialLocation?.longitude,
      projectId: filters.projectId ?? '',
      departmentId: filters.departmentId ?? '',
      municipalityId: filters.municipalityId ?? '',
      sectorId: filters.sectorId ?? '',
      reportedBy: '',
    },
  })

  const typeValue = watch('type')
  const severityValue = watch('severity')
  const sourceValue = watch('source') ?? 'Supervisor'
  const descriptionValue = watch('description') ?? ''
  const projectValue = watch('projectId') ?? ''
  const departmentValue = watch('departmentId') ?? ''
  const municipalityValue = watch('municipalityId') ?? ''
  const sectorValue = watch('sectorId') ?? ''

  const handleFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch {
      setSubmitError('No se pudo registrar la zona de riesgo. Intenta nuevamente.')
    }
  })

  return (
    <form className="neo-form-stack" onSubmit={handleFormSubmit}>
      <div className={compact ? 'grid gap-4 sm:grid-cols-2' : 'flex flex-col gap-4'}>
        <Input
          label="Título del riesgo"
          placeholder="Ej. Bloqueo intermitente en vía principal"
          error={errors.title?.message}
          {...register('title')}
        />

        <Select
          label="Tipo de riesgo"
          name="type"
          placeholder="Seleccionar"
          options={typeOptions}
          value={typeValue}
          error={errors.type?.message}
          onChange={(value) => setValue('type', value, { shouldValidate: true })}
        />

        <Select
          label="Nivel de riesgo"
          name="severity"
          options={severityOptions}
          value={severityValue}
          onChange={(value) =>
            setValue('severity', value as CreateRiskFormValues['severity'], { shouldValidate: true })
          }
        />
        {severityValue ? (
          <p className="text-xs text-amber-700 sm:col-span-2">{RISK_SEVERITY_HINTS[severityValue]}</p>
        ) : null}

        <Select
          label="Fuente del reporte"
          name="source"
          options={sourceOptions}
          value={sourceValue}
          onChange={(value) => setValue('source', value)}
        />

        <Select
          label="Proyecto"
          name="projectId"
          placeholder="Opcional"
          options={[{ value: '', label: 'Sin asignar' }, ...projectOptions]}
          value={projectValue}
          onChange={(value) => setValue('projectId', value || undefined)}
        />

        <Select
          label="Departamento"
          name="departmentId"
          placeholder="Opcional"
          options={[{ value: '', label: 'Sin asignar' }, ...departmentOptions]}
          value={departmentValue}
          onChange={(value) => setValue('departmentId', value || undefined)}
        />

        <Select
          label="Municipio"
          name="municipalityId"
          placeholder="Opcional"
          options={[{ value: '', label: 'Sin asignar' }, ...municipalityOptions]}
          value={municipalityValue}
          onChange={(value) => setValue('municipalityId', value || undefined)}
        />

        <Select
          label="Sector"
          name="sectorId"
          placeholder="Opcional"
          options={[{ value: '', label: 'Sin asignar' }, ...sectorOptions]}
          value={sectorValue}
          onChange={(value) => setValue('sectorId', value || undefined)}
        />

        <Input
          label="Reportado por (opcional)"
          {...register('reportedBy')}
          className={compact ? 'sm:col-span-2' : undefined}
        />
      </div>

      <Textarea
        label="Descripción"
        name="description"
        value={descriptionValue}
        onChange={(value) => setValue('description', value)}
        placeholder="Detalle la condición de riesgo y recomendaciones para el personal..."
        rows={compact ? 3 : 4}
        error={errors.description?.message}
      />

      {errors.latitude || errors.longitude ? (
        <p className="text-sm font-medium text-red-600">
          {errors.latitude?.message ?? errors.longitude?.message}
        </p>
      ) : null}

      {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Publicar zona de riesgo'}
        </Button>
      </div>
    </form>
  )
}
