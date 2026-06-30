import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'
import { useCreateUser, useRoles, useUpdateUser, useUser } from '../hooks/useAdmin'

export function UserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { data: user, isLoading, isError } = useUser(id)
  const { data: roles } = useRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser(id ?? '')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [emailVerified, setEmailVerified] = useState(true)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setFullName(user.full_name)
    setEmail(user.email)
    setUsername(user.username ?? '')
    setIsActive(user.is_active)
    setEmailVerified(user.email_verified)
    if (roles) {
      const roleIds = roles.filter((role) => user.roles.includes(role.code)).map((role) => role.id)
      setSelectedRoleIds(roleIds)
    }
  }, [user, roles])

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((current) =>
      current.includes(roleId) ? current.filter((item) => item !== roleId) : [...current, roleId],
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      if (isEdit && id) {
        await updateUser.mutateAsync({
          full_name: fullName,
          email,
          username: username.trim() || undefined,
          password: password.trim() || undefined,
          is_active: isActive,
          email_verified: emailVerified,
          role_ids: selectedRoleIds,
        })
      } else {
        if (!password.trim()) {
          setError('La contraseña es obligatoria para usuarios nuevos.')
          return
        }
        await createUser.mutateAsync({
          full_name: fullName,
          email,
          username: username.trim() || undefined,
          password,
          is_active: isActive,
          email_verified: emailVerified,
          role_ids: selectedRoleIds,
        })
      }
      navigate(ROUTES.users)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el usuario.')
    }
  }

  if (isEdit && isLoading) {
    return <AsyncBoundary isLoading isError={false} isEmpty={false} loadingTitle="Cargando usuario" />
  }

  if (isEdit && isError) {
    return (
      <AsyncBoundary
        isLoading={false}
        isError
        isEmpty={false}
        errorTitle="No se pudo cargar el usuario"
        onRetry={() => navigate(ROUTES.users)}
      />
    )
  }

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        description="Define datos de acceso y perfiles asignados."
        actions={
          <Link to={ROUTES.users}>
            <Button variant="secondary" size="sm">
              Volver
            </Button>
          </Link>
        }
      />

      <Card padding="lg">
        <form className="neo-form-stack max-w-xl" onSubmit={handleSubmit}>
          <Input label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input
            label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Usuario activo
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailVerified}
              onChange={(e) => setEmailVerified(e.target.checked)}
            />
            Correo verificado
          </label>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Perfiles / roles</p>
            <div className="flex flex-col gap-2">
              {roles?.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                  />
                  <span className="font-medium">{role.name}</span>
                  <span className="text-slate-500">({role.code})</span>
                </label>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
            {createUser.isPending || updateUser.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </Card>
    </section>
  )
}
