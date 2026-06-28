import { Link } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto my-16 flex max-w-[560px] flex-col items-start gap-4" padding="lg">
      <h1 className="text-[1.75rem] font-semibold">Sin permisos</h1>
      <p className="text-slate-500">No tienes acceso a este recurso. Contacta al administrador de NeoAlert.</p>
      <Link to={ROUTES.dashboard} className="no-underline">
        <Button>Volver al dashboard</Button>
      </Link>
    </Card>
  )
}

export function SessionExpiredPage() {
  return (
    <Card className="mx-auto my-16 flex max-w-[560px] flex-col items-start gap-4" padding="lg">
      <h1 className="text-[1.75rem] font-semibold">Sesión expirada</h1>
      <p className="text-slate-500">Tu sesión ha caducado. Inicia sesión nuevamente para continuar.</p>
      <Link to={ROUTES.login} className="no-underline">
        <Button>Iniciar sesión</Button>
      </Link>
    </Card>
  )
}
