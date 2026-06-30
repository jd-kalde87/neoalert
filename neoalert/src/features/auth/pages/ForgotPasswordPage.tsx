import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'
import { USE_MOCK_API } from '@shared/config/api.config'
import { forgotPassword } from '@features/auth/services/auth.api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    if (USE_MOCK_API) {
      setMessage('Si la cuenta existe, recibirás un enlace de recuperación.')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setMessage('Si la cuenta existe, recibirás un enlace de recuperación.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar el enlace.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Recuperar contraseña</h2>
      <p className="mt-1.5 mb-5 text-slate-500">
        Te enviaremos un enlace para restablecer tu acceso.
      </p>

      <form className="neo-form-stack" onSubmit={handleSubmit}>
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error ?? undefined}
        />
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </Button>
      </form>

      <div className="mt-4 text-sm">
        <Link to={ROUTES.login}>Volver al login</Link>
      </div>
    </Card>
  )
}

export function MfaPage() {
  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Verificación MFA</h2>
      <p className="mt-1.5 mb-5 text-slate-500">Ingresa el código de tu aplicación autenticadora.</p>

      <form className="neo-form-stack" onSubmit={(event) => event.preventDefault()}>
        <Input label="Código MFA" name="code" inputMode="numeric" autoComplete="one-time-code" />
        <Button type="submit" fullWidth>
          Verificar
        </Button>
      </form>
    </Card>
  )
}

export function SelectTenantPage() {
  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Seleccionar organización</h2>
      <p className="mt-1.5 mb-5 text-slate-500">Elige el tenant con el que deseas operar.</p>

      <form className="neo-form-stack" onSubmit={(event) => event.preventDefault()}>
        <Input label="Organización" name="tenant" placeholder="Ej. NeoAlert Colombia" />
        <Button type="submit" fullWidth>
          Continuar
        </Button>
      </form>
    </Card>
  )
}
