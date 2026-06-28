import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import {
  usePrimaryPlant,
  useRouteNameOptions,
  useWorkSiteLabelOptions,
  useWorkSites,
} from '@shared/hooks/useOperations'
import { useUiStore } from '@shared/stores/uiStore'
import {
  createAttendanceMarkSchema,
  type CreateAttendanceMarkFormValues,
} from '../types/attendance.schema'
import { MARK_TYPE_LABELS } from '../types/attendance.types'
import { useRouteSafetyValidation } from '../hooks/useAttendance'
import { RouteSafetyAlert } from './RouteSafetyAlert'

const markTypeOptions = Object.entries(MARK_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface AttendanceMarkFormProps {
  onSubmit: (values: CreateAttendanceMarkFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function AttendanceMarkForm({ onSubmit, isSubmitting = false }: AttendanceMarkFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const isOnline = useUiStore((state) => state.isOnline)
  const primaryPlant = usePrimaryPlant()
  const routeOptions = useRouteNameOptions()
  const workSiteOptions = useWorkSiteLabelOptions()
  const workSites = useWorkSites()
  const siteSelectOptions = workSiteOptions.map((site) => ({
    value: site.label,
    label: site.label,
  }))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAttendanceMarkFormValues>({
    resolver: zodResolver(createAttendanceMarkSchema),
    defaultValues: {
      markType: 'entry',
      routeName: '',
      targetWorkSite: '',
      siteId: '',
      locationLabel: '',
      latitude: primaryPlant?.latitude ?? 4.695,
      longitude: primaryPlant?.longitude ?? -74.13,
      gpsAccuracyMeters: 15,
      networkOnline: isOnline,
      justification: '',
      forceExceptional: false,
    },
  })

  const routeName = watch('routeName')
  const targetWorkSite = watch('targetWorkSite')
  const markType = watch('markType')
  const forceExceptional = watch('forceExceptional')

  const { data: validation, isLoading: validating } = useRouteSafetyValidation(
    routeName,
    targetWorkSite,
  )

  useEffect(() => {
    setValue('networkOnline', isOnline)
  }, [isOnline, setValue])

  const applyPlantLocation = () => {
    if (!primaryPlant) return
    setValue('locationLabel', `${primaryPlant.name} — punto de marcación`)
    setValue('latitude', primaryPlant.latitude)
    setValue('longitude', primaryPlant.longitude)
    setValue('gpsAccuracyMeters', 10)
  }

  const applySiteLocation = () => {
    const site = workSiteOptions.find((item) => item.label === targetWorkSite)
    const workSite = workSites.find((item) => item.id === site?.id)
    if (!workSite) return
    setValue('locationLabel', `${workSite.name} — llegada`)
    setValue('latitude', workSite.latitude)
    setValue('longitude', workSite.longitude)
    setValue('gpsAccuracyMeters', 12)
    setValue('siteId', workSite.id)
  }

  const handleSiteChange = (label: string) => {
    setValue('targetWorkSite', label, { shouldValidate: true })
    const site = workSiteOptions.find((item) => item.label === label)
    setValue('siteId', site?.id ?? '')
  }

  const handleFormSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    setSubmitSuccess(null)
    try {
      await onSubmit(values)
      setSubmitSuccess('Marcación enviada. Revisa el resultado arriba del formulario.')
    } catch {
      setSubmitError('No se pudo registrar la marcación.')
    }
  })

  const needsJustification =
    validation?.level === 'warning' ||
    markType === 'exceptional' ||
    (validation?.level === 'blocked' && forceExceptional)

  return (
    <form className="neo-form-stack" onSubmit={handleFormSubmit}>
      <div className="flex flex-wrap justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[0.8125rem]">
        <span>GPS simulado · Precisión {watch('gpsAccuracyMeters')} m</span>
        <span className={isOnline ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
          {isOnline ? 'En línea' : 'Sin conexión'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[768px]:grid-cols-2">
        <Select
          label="Tipo de marcación"
          name="markType"
          value={markType}
          options={markTypeOptions}
          placeholder=""
          onChange={(value) =>
            setValue('markType', value as CreateAttendanceMarkFormValues['markType'], {
              shouldValidate: true,
            })
          }
        />
        <Select
          label="Ruta operativa"
          name="routeName"
          value={routeName}
          options={routeOptions}
          onChange={(value) => setValue('routeName', value, { shouldValidate: true })}
          error={errors.routeName?.message}
        />
        <Select
          label="Sitio de trabajo destino"
          name="targetWorkSite"
          value={targetWorkSite}
          options={siteSelectOptions}
          onChange={handleSiteChange}
          error={errors.targetWorkSite?.message}
        />
        <Input
          label="Ubicación detectada"
          {...register('locationLabel')}
          error={errors.locationLabel?.message}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={applyPlantLocation}>
          Ubicación: Planta central
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={applySiteLocation}
          disabled={!targetWorkSite}
        >
          Ubicación: Sitio destino
        </Button>
      </div>

      <RouteSafetyAlert validation={validation} isLoading={validating} />

      {validation?.level === 'blocked' ? (
        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={forceExceptional}
            onChange={(event) => setValue('forceExceptional', event.target.checked)}
          />
          <span>Solicitar marcación excepcional (requiere justificación y aprobación)</span>
        </label>
      ) : null}

      {needsJustification ? (
        <Textarea
          label="Justificación"
          name="justification"
          value={watch('justification') ?? ''}
          onChange={(value) => setValue('justification', value)}
          error={errors.justification?.message}
          rows={3}
          placeholder="Motivo del desplazamiento o marcación excepcional..."
        />
      ) : null}

      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
      {submitSuccess ? <p className="text-sm font-semibold text-emerald-600">{submitSuccess}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || validating}>
          {isSubmitting ? 'Validando y registrando...' : 'Registrar marcación'}
        </Button>
      </div>
    </form>
  )
}
