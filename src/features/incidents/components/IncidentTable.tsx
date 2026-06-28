import { Link } from 'react-router-dom'
import type { Incident } from '../types/incident.types'
import { IncidentSeverityBadge } from './IncidentSeverityBadge'
import { IncidentStatusBadge } from './IncidentStatusBadge'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

interface IncidentTableProps {
  incidents: Incident[]
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  return (
    <>
      <div className="neo-table-wrap max-[900px]:hidden">
        <table className="neo-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Incidente</th>
              <th>Tipo</th>
              <th>Riesgo</th>
              <th>Estado</th>
              <th>Ruta / ubicación</th>
              <th>Tránsito</th>
              <th>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>
                  <Link to={`/incidents/${incident.id}`} className="neo-table-link font-bold">
                    {incident.code}
                  </Link>
                </td>
                <td>{incident.title}</td>
                <td>{incident.type}</td>
                <td>
                  <IncidentSeverityBadge severity={incident.severity} />
                </td>
                <td>
                  <IncidentStatusBadge status={incident.status} />
                </td>
                <td>{incident.routeName ?? incident.location}</td>
                <td>
                  {incident.blocksTransit ? (
                    <span className="text-[0.8125rem] font-bold text-red-600">Bloqueado</span>
                  ) : (
                    <span className="text-[0.8125rem] font-semibold text-amber-600">Precaución</span>
                  )}
                </td>
                <td>{formatDate(incident.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 hidden list-none flex-col gap-3 p-0 max-[900px]:flex">
        {incidents.map((incident) => (
          <li
            key={incident.id}
            className="rounded-xl border border-slate-200 bg-white p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <Link to={`/incidents/${incident.id}`} className="neo-table-link font-bold">
                {incident.code}
              </Link>
              <IncidentSeverityBadge severity={incident.severity} />
            </div>
            <strong className="my-1.5 block">{incident.title}</strong>
            <p className="mb-2 text-[0.8125rem] text-slate-500">
              {incident.routeName ?? incident.location}
            </p>
            <div className="flex items-center justify-between gap-2">
              <IncidentStatusBadge status={incident.status} />
              <span className="text-xs text-slate-500">
                {incident.blocksTransit ? 'No transitar' : 'Precaución'} ·{' '}
                {formatDate(incident.updatedAt)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
