import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import type { AuditLogEntry } from '../types/audit.types'
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from '../types/audit.types'
import { AuditOutcomeBadge } from './AuditOutcomeBadge'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

interface AuditTableProps {
  entries: AuditLogEntry[]
}

export function AuditTable({ entries }: AuditTableProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No hay eventos para los filtros seleccionados.</p>
  }

  return (
    <div className="neo-table-wrap">
      <table className="neo-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Actor</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Resumen</th>
            <th>Resultado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDate(entry.timestamp)}</td>
              <td>
                <div className="flex flex-col gap-0.5">
                  <strong>{entry.actor}</strong>
                  <span className="text-xs text-slate-500">{entry.actorRole}</span>
                </div>
              </td>
              <td>{AUDIT_ACTION_LABELS[entry.action]}</td>
              <td>{AUDIT_ENTITY_LABELS[entry.entity]}</td>
              <td className="max-w-80 text-slate-500">{entry.summary}</td>
              <td>
                <AuditOutcomeBadge outcome={entry.outcome} />
              </td>
              <td>
                <Link
                  to={ROUTES.auditDetail.replace(':id', entry.id)}
                  className="neo-table-link"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
