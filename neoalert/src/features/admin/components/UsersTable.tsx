import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { ROUTES } from '@shared/constants/routes'
import type { AdminUser } from '../types/admin.types'

interface UsersTableProps {
  users: AdminUser[]
  onDelete: (user: AdminUser) => void
  canWrite: boolean
}

export function UsersTable({ users, onDelete, canWrite }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="neo-table w-full">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Usuario</th>
            <th>Roles</th>
            <th>Estado</th>
            {canWrite ? <th className="w-28">Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="font-medium text-slate-900">{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.username ?? '—'}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">Sin roles</span>
                  )}
                </div>
              </td>
              <td>
                <span
                  className={
                    user.is_active
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }
                >
                  {user.is_active ? 'Activo' : 'Inactivo'}
                  {!user.email_verified ? ' · sin verificar' : ''}
                </span>
              </td>
              {canWrite ? (
                <td>
                  <div className="flex gap-1">
                    <Link to={ROUTES.userEdit.replace(':id', user.id)}>
                      <Button variant="ghost" size="sm" aria-label={`Editar ${user.full_name}`}>
                        <Pencil className="size-3.5" />
                      </Button>
                    </Link>
                    {!user.is_superadmin ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Eliminar ${user.full_name}`}
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="size-3.5 text-red-600" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
