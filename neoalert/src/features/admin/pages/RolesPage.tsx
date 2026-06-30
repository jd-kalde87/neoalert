import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { PERMISSIONS } from '@shared/constants/permissions'
import { useAuthAccess } from '@shared/hooks/usePermissions'
import { AccessRoutesTable } from '../components/AccessRoutesTable'
import {
  useAccessRoutes,
  useCreateRole,
  usePermissionsCatalog,
  useReplaceRolePermissions,
  useRolePermissions,
  useRoles,
} from '../hooks/useAdmin'

export function RolesPage() {
  const { hasPermission } = useAuthAccess()
  const canManage = hasPermission(PERMISSIONS.rolesManage)
  const { data: roles, isLoading, isError, refetch } = useRoles()
  const { data: permissions } = usePermissionsCatalog()
  const { data: accessRoutes } = useAccessRoutes()

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const { data: rolePermissions, isLoading: permissionsLoading } = useRolePermissions(
    selectedRoleId ?? undefined,
  )
  const replacePermissions = useReplaceRolePermissions(selectedRoleId ?? '')
  const createRole = useCreateRole()

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set())
  const [newRoleCode, setNewRoleCode] = useState('')
  const [newRoleName, setNewRoleName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roles?.length) return
    if (!selectedRoleId) {
      setSelectedRoleId(roles[0].id)
    }
  }, [roles, selectedRoleId])

  useEffect(() => {
    if (!rolePermissions) return
    setSelectedPermissionIds(new Set(rolePermissions.map((permission) => permission.id)))
  }, [rolePermissions])

  const selectedRole = useMemo(
    () => roles?.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  )

  const togglePermission = (permissionId: string, checked: boolean) => {
    setSelectedPermissionIds((current) => {
      const next = new Set(current)
      if (checked) next.add(permissionId)
      else next.delete(permissionId)
      return next
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return
    setError(null)
    setMessage(null)
    try {
      await replacePermissions.mutateAsync(Array.from(selectedPermissionIds))
      setMessage('Permisos actualizados. Los usuarios deben volver a iniciar sesión para ver los cambios.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudieron guardar los permisos.')
    }
  }

  const handleCreateRole = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      const role = await createRole.mutateAsync({
        code: newRoleCode.trim(),
        name: newRoleName.trim(),
      })
      setNewRoleCode('')
      setNewRoleName('')
      setSelectedRoleId(role.id)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear el rol.')
    }
  }

  return (
    <section>
      <PageHeader
        title="Roles y permisos"
        description="Asigna acceso a rutas de la aplicación según perfiles operativos."
      />

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <Card padding="lg">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Perfiles</h2>
          <AsyncBoundary
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && roles?.length === 0}
            loadingTitle="Cargando roles"
            errorTitle="No se pudieron cargar los roles"
            emptyTitle="Sin roles"
            onRetry={() => refetch()}
          >
            <div className="flex flex-col gap-1">
              {roles?.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedRoleId === role.id
                      ? 'bg-brand-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <span className="block font-medium">{role.name}</span>
                  <span className="block text-xs opacity-80">{role.code}</span>
                </button>
              ))}
            </div>
          </AsyncBoundary>

          {canManage ? (
            <form className="neo-form-stack mt-6 border-t border-slate-200 pt-4" onSubmit={handleCreateRole}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nuevo rol</p>
              <Input label="Código" value={newRoleCode} onChange={(e) => setNewRoleCode(e.target.value)} />
              <Input label="Nombre" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
              <Button type="submit" size="sm" variant="secondary" disabled={createRole.isPending}>
                Crear rol
              </Button>
            </form>
          ) : null}
        </Card>

        <Card padding="lg">
          {selectedRole ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedRole.name}</h2>
                  <p className="text-sm text-slate-500">{selectedRole.description ?? selectedRole.code}</p>
                </div>
                {canManage ? (
                  <Button
                    size="sm"
                    onClick={handleSavePermissions}
                    disabled={replacePermissions.isPending || permissionsLoading}
                  >
                    {replacePermissions.isPending ? 'Guardando…' : 'Guardar permisos'}
                  </Button>
                ) : null}
              </div>

              {message ? <p className="mb-3 text-sm text-emerald-600">{message}</p> : null}
              {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

              {permissions && accessRoutes ? (
                <AccessRoutesTable
                  routes={accessRoutes}
                  permissions={permissions}
                  selectedPermissionIds={selectedPermissionIds}
                  onTogglePermission={togglePermission}
                  disabled={!canManage}
                />
              ) : (
                <AsyncBoundary isLoading isError={false} isEmpty={false} loadingTitle="Cargando catálogo" />
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Selecciona un perfil para configurar sus permisos.</p>
          )}
        </Card>
      </div>
    </section>
  )
}
