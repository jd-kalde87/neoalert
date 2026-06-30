import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { USE_MOCK_API } from '@shared/config/api.config'
import { verifyEmail } from '@features/auth/services/auth.api'
import { mapAuthError } from '@features/auth/utils/auth-errors'

type VerifyStatus = 'loading' | 'success' | 'error' | 'missing-token'

function resolveInitialStatus(token: string): VerifyStatus {
  if (!token) {
    return 'missing-token'
  }
  if (USE_MOCK_API) {
    return 'success'
  }
  return 'loading'
}

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [status, setStatus] = useState<VerifyStatus>(() => resolveInitialStatus(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || USE_MOCK_API) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        await verifyEmail(token)
        if (!cancelled) {
          setStatus('success')
        }
      } catch (verifyError) {
        if (!cancelled) {
          const message =
            verifyError instanceof Error ? verifyError.message : 'No se pudo verificar el correo.'
          setError(mapAuthError(message))
          setStatus('error')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Verificar correo</h2>
      <p className="mt-1.5 mb-5 text-slate-500">
        {status === 'loading'
          ? 'Estamos confirmando tu dirección de correo…'
          : 'Confirma tu cuenta para acceder a NeoAlert'}
      </p>

      {status === 'loading' ? (
        <p className="text-sm text-slate-600">Verificando enlace…</p>
      ) : null}

      {status === 'success' ? (
        <div className="neo-form-stack">
          <p className="text-sm text-emerald-600">
            Tu correo fue verificado correctamente. Ya puedes iniciar sesión.
          </p>
          <Button fullWidth onClick={() => navigate(ROUTES.login)}>
            Ir al inicio de sesión
          </Button>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="neo-form-stack">
          <p className="text-sm text-red-600">{error ?? 'No se pudo verificar el correo.'}</p>
          <Button fullWidth variant="secondary" onClick={() => navigate(ROUTES.login)}>
            Volver al inicio de sesión
          </Button>
        </div>
      ) : null}

      {status === 'missing-token' ? (
        <div className="neo-form-stack">
          <p className="text-sm text-red-600">
            El enlace de verificación no es válido o falta el token.
          </p>
          <Button fullWidth variant="secondary" onClick={() => navigate(ROUTES.register)}>
            Crear cuenta
          </Button>
          <div className="text-sm">
            <Link to={ROUTES.login}>¿Ya tienes cuenta? Inicia sesión</Link>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
