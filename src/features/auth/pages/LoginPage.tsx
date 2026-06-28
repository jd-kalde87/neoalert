import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'
import { useAuthStore } from '@shared/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Ingresa usuario/correo y contraseña.')
      return
    }

    setSession({
      user: {
        id: 'demo-user',
        name: email.split('@')[0] || 'Operador NeoAlert',
        email,
        roles: ['supervisor'],
      },
      accessToken: 'demo-token',
    })

    navigate(ROUTES.dashboard)
  }

  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
      <p className="mt-1.5 mb-5 text-slate-500">Accede a la plataforma NeoAlert</p>

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

        <Button type="submit" fullWidth>
          Entrar
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to={ROUTES.forgotPassword}>¿Olvidaste tu contraseña?</Link>
        <Link to={ROUTES.mfa}>Verificar MFA</Link>
      </div>
    </Card>
  )
}
