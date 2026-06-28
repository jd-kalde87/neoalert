import { Link } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { ROUTES } from '@shared/constants/routes'

export function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-[420px] shadow-xl" padding="lg">
      <h2 className="text-2xl font-semibold">Recuperar contraseña</h2>
      <p className="mt-1.5 mb-5 text-slate-500">
        Te enviaremos un enlace para restablecer tu acceso.
      </p>

      <form className="neo-form-stack" onSubmit={(event) => event.preventDefault()}>
        <Input label="Correo electrónico" name="email" type="email" autoComplete="email" />
        <Button type="submit" fullWidth>
          Enviar enlace
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
