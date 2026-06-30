import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'
import { USE_MOCK_API } from '@shared/config/api.config'
import { googleSignIn, register as registerUser } from '@features/auth/services/auth.api'
import { GoogleSignInButton } from '@features/auth/components/GoogleSignInButton'
import { registerSchema, type RegisterFormValues } from '@features/auth/types/register.schema'
import { mapAuthError, translateAuthError } from '@features/auth/utils/auth-errors'
import { useAuthStore } from '@shared/stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  })

  const completeSession = (result: Awaited<ReturnType<typeof googleSignIn>>) => {
    setSession({
      user: result.user,
      accessToken: result.tokens.access_token,
      refreshToken: result.tokens.refresh_token,
      tenantId: result.tenantId,
    })
    navigate(ROUTES.dashboard)
  }

  const handleGoogleSuccess = async (idToken: string) => {
    if (USE_MOCK_API) {
      setSession({
        user: {
          id: 'google-demo-user',
          name: 'Usuario Google',
          email: 'google@neoalert.com',
          roles: ['supervisor'],
          permissions: [],
        },
        accessToken: 'demo-token',
      })
      navigate(ROUTES.dashboard)
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await googleSignIn(idToken)
      completeSession(result)
    } catch (googleError) {
      const message =
        googleError instanceof Error ? googleError.message : 'No se pudo iniciar sesión con Google.'
      setError(mapAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSuccess(null)

    if (USE_MOCK_API) {
      setSuccess('Cuenta creada (modo demo). Revisa tu correo para verificar el acceso.')
      return
    }

    setLoading(true)
    try {
      const result = await registerUser({
        email: values.email,
        password: values.password,
        full_name: values.fullName,
        username: values.username?.trim() || undefined,
      })
      setSuccess(
        result.verification_email_sent
          ? 'Cuenta creada. Revisa tu correo para verificar el acceso.'
          : result.message,
      )
    } catch (submitError) {
      setError(translateAuthError(submitError, 'No se pudo crear la cuenta.'))
    } finally {
      setLoading(false)
    }
  })

  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Crear cuenta</h2>
      <p className="mt-1.5 mb-5 text-slate-500">Regístrate en la plataforma NeoAlert</p>

      <form className="neo-form-stack" onSubmit={onSubmit}>
        <Input
          label="Nombre completo"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Usuario (opcional)"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message ?? error ?? undefined}
          {...register('confirmPassword')}
        />

        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Creando cuenta…' : 'Registrarse'}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-500">o</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton
        disabled={loading}
        onSuccess={handleGoogleSuccess}
        onError={(message) => setError(message)}
      />

      <div className="mt-4 text-sm">
        <Link to={ROUTES.login}>¿Ya tienes cuenta? Inicia sesión</Link>
      </div>
    </Card>
  )
}
