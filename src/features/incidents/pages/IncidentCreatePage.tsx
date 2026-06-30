import { Navigate } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'

/** El registro de incidentes se hace desde el mapa: clic en el punto → modal. */
export function IncidentCreatePage() {
  return <Navigate to={ROUTES.maps} replace />
}
