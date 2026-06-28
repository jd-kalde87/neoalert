import { Link } from 'react-router-dom'
import type { AttendanceRecord } from '../types/attendance.types'
import { MARK_TYPE_LABELS } from '../types/attendance.types'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

const validationClasses = {
  clear: 'text-emerald-600',
  warning: 'text-amber-600',
  blocked: 'text-red-600',
} as const

interface AttendanceTableProps {
  records: AttendanceRecord[]
}

export function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <>
      <div className="neo-table-wrap max-[900px]:hidden">
        <table className="neo-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Marcación</th>
              <th>Ruta</th>
              <th>Ubicación</th>
              <th>Validación ruta</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.userName}</td>
                <td>{MARK_TYPE_LABELS[record.markType]}</td>
                <td>{record.routeName}</td>
                <td>{record.locationLabel}</td>
                <td>
                  <span
                    className={`mr-1.5 inline-block text-xs font-bold ${validationClasses[record.validation.level]}`}
                  >
                    {record.validation.level === 'blocked'
                      ? 'Bloqueada'
                      : record.validation.level === 'warning'
                        ? 'Precaución'
                        : 'OK'}
                  </span>
                  {record.validation.blockingIncidents[0] ? (
                    <Link to={`/incidents/${record.validation.blockingIncidents[0].id}`}>
                      {record.validation.blockingIncidents[0].code}
                    </Link>
                  ) : null}
                </td>
                <td>
                  <AttendanceStatusBadge status={record.status} />
                  {record.rejectedReason ? (
                    <p className="mt-1.5 text-xs text-red-600">{record.rejectedReason}</p>
                  ) : null}
                </td>
                <td>{formatDate(record.markedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 hidden list-none flex-col gap-3 p-0 max-[900px]:flex">
        {records.map((record) => (
          <li
            key={record.id}
            className="rounded-xl border border-slate-200 bg-white p-3.5"
          >
            <div className="mb-1.5 flex justify-between gap-2">
              <strong>{record.userName}</strong>
              <AttendanceStatusBadge status={record.status} />
            </div>
            <p className="mb-1 text-[0.8125rem] text-slate-500">
              {MARK_TYPE_LABELS[record.markType]} · {record.routeName}
            </p>
            <p className="mb-1 text-[0.8125rem] text-slate-500">{record.locationLabel}</p>
            {record.rejectedReason ? (
              <p className="mb-1 text-[0.8125rem] text-red-600">{record.rejectedReason}</p>
            ) : null}
            <small className="text-slate-500">{formatDate(record.markedAt)}</small>
          </li>
        ))}
      </ul>
    </>
  )
}
