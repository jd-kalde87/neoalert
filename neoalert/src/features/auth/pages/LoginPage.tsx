import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'
import { USE_MOCK_API } from '@shared/config/api.config'
import { GoogleSignInButton } from '@features/auth/components/GoogleSignInButton'
import { googleSignIn, login } from '@features/auth/services/auth.api'
import { mapAuthError } from '@features/auth/utils/auth-errors'
import { useAuthStore } from '@shared/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const completeSession = (result: Awaited<ReturnType<typeof login>>) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Ingresa usuario/correo y contraseña.')
      return
    }

    if (USE_MOCK_API) {
      setSession({
        user: {
          id: 'demo-user',
          name: email.split('@')[0] || 'Operador NeoAlert',
          email,
          roles: ['supervisor'],
          permissions: [],
        },
        accessToken: 'demo-token',
      })
      navigate(ROUTES.dashboard)
      return
    }

    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      completeSession(result)
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión.'
      setError(mapAuthError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
      <p className="mt-1.5 mb-5 text-slate-500">Accede a la plataforma NeoAlert</p>
      <p className="-mt-3 mb-5 text-xs text-slate-500">
        Si te registraste con Google, usa «Continuar con Google»; no puedes usar tu contraseña de Gmail.
      </p>

      <form className="neo-form-stack" onSubmit={handleSubmit}>
        <Input
          label="Usuario o correo"
          name="email"
          type="text"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={error ?? undefined}
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
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

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to={ROUTES.register}>Crear cuenta</Link>
        <Link to={ROUTES.forgotPassword}>¿Olvidaste tu contraseña?</Link>
        <Link to={ROUTES.mfa}>Verificar MFA</Link>
      </div>
    </Card>
  )
}
