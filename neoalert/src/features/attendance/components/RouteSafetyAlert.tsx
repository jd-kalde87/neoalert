import { Link } from 'react-router-dom'
import type { RouteSafetyValidation } from '../types/attendance.types'

interface RouteSafetyAlertProps {
  validation?: RouteSafetyValidation
  isLoading?: boolean
}

const levelClasses = {
  clear: 'border-emerald-500/35 bg-emerald-50',
  warning: 'border-amber-500/35 bg-amber-50',
  blocked: 'border-red-500/35 bg-red-50',
  idle: 'border-slate-200 bg-slate-50 text-slate-500',
  loading: 'border-slate-200 bg-slate-50 text-slate-500',
} as const

export function RouteSafetyAlert({ validation, isLoading }: RouteSafetyAlertProps) {
  if (isLoading) {
    return (
      <div
        className={`rounded-md border px-4 py-3.5 text-sm ${levelClasses.loading}`}
        role="status"
      >
        Validando incidentes activos en la ruta...
      </div>
    )
  }

  if (!validation) {
    return (
      <div className={`rounded-md border px-4 py-3.5 text-sm ${levelClasses.idle}`}>
        Selecciona ruta y sitio de trabajo para validar seguridad.
      </div>
    )
  }

  return (
    <div
      className={`rounded-md border px-4 py-3.5 text-sm ${levelClasses[validation.level]}`}
      role="alert"
    >
      <strong className="mb-1.5 block">
        {validation.level === 'blocked'
          ? 'Desplazamiento no permitido'
          : validation.level === 'warning'
            ? 'Precaución en ruta'
            : 'Ruta validada'}
      </strong>
      <p className="mb-2 text-slate-500">{validation.message}</p>

      {validation.blockingIncidents.length > 0 ? (
        <ul className="m-0 list-disc pl-4 text-[0.8125rem]">
          {validation.blockingIncidents.map((incident) => (
            <li key={incident.id}>
              <Link to={`/incidents/${incident.id}`} className="font-semibold no-underline hover:underline">
                {incident.code} — {incident.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {validation.warningIncidents.length > 0 ? (
        <ul className="m-0 list-disc pl-4 text-[0.8125rem]">
          {validation.warningIncidents.map((incident) => (
            <li key={incident.id}>
              <Link to={`/incidents/${incident.id}`} className="font-semibold no-underline hover:underline">
                {incident.code} — {incident.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
