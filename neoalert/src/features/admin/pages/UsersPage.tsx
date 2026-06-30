import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'
import { PERMISSIONS } from '@shared/constants/permissions'
import { useAuthAccess } from '@shared/hooks/usePermissions'
import { UsersTable } from '../components/UsersTable'
import { useDeleteUser, useUsers } from '../hooks/useAdmin'
import type { AdminUser } from '../types/admin.types'

export function UsersPage() {
  const { hasPermission } = useAuthAccess()
  const canWrite = hasPermission(PERMISSIONS.usersWrite)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useUsers(search)
  const deleteUser = useDeleteUser()

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`¿Eliminar al usuario ${user.full_name}?`)) return
    try {
      await deleteUser.mutateAsync(user.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el usuario.'
      window.alert(message)
    }
  }

  return (
    <section>
      <PageHeader
        title="Usuarios"
        description="Administra cuentas registradas, estados y asignación de perfiles."
        actions={
          canWrite ? (
            <Link to={ROUTES.userNew}>
              <Button size="sm">Nuevo usuario</Button>
            </Link>
          ) : null
        }
      />

      <Card padding="lg">
        <div className="mb-4 max-w-sm">
          <Input
            label="Buscar"
            name="search"
            placeholder="Nombre, correo o usuario"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <AsyncBoundary
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && data?.length === 0}
          loadingTitle="Cargando usuarios"
          errorTitle="No se pudo cargar la lista de usuarios"
          emptyTitle="Sin usuarios"
          emptyDescription="No hay usuarios que coincidan con la búsqueda."
          onRetry={() => refetch()}
        >
          {data && data.length > 0 ? (
            <UsersTable users={data} onDelete={handleDelete} canWrite={canWrite} />
          ) : null}
        </AsyncBoundary>
      </Card>
    </section>
  )
}
