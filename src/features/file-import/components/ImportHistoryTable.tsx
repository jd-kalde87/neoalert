import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import type { ImportJob } from '../types/import.types'
import { ImportStatusBadge } from './ImportStatusBadge'

interface ImportHistoryTableProps {
  jobs: ImportJob[]
}

export function ImportHistoryTable({ jobs }: ImportHistoryTableProps) {
  if (jobs.length === 0) {
    return <p className="text-sm text-slate-500">No hay importaciones registradas.</p>
  }

  return (
    <div className="neo-table-wrap">
      <table className="neo-table">
        <thead>
          <tr>
            <th>Archivo</th>
            <th>Plantilla</th>
            <th>Estado</th>
            <th>Filas</th>
            <th>Errores</th>
            <th>Subido</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.fileName}</td>
              <td>{job.templateName}</td>
              <td>
                <ImportStatusBadge status={job.status} />
              </td>
              <td>
                {job.validRows}/{job.totalRows}
              </td>
              <td>{job.errorRows}</td>
              <td>{new Date(job.uploadedAt).toLocaleString('es-CO')}</td>
              <td>
                <Link
                  to={ROUTES.importDetail.replace(':id', job.id)}
                  className="neo-table-link"
                >
                  Detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
