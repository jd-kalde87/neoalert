import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { IncidentForm } from '../components/IncidentForm'
import { useCreateIncident } from '../hooks/useIncidents'
import type { CreateIncidentFormValues } from '../types/incident.schema'

export function IncidentCreatePage() {
  const navigate = useNavigate()
  const createIncident = useCreateIncident()

  const handleSubmit = async (values: CreateIncidentFormValues) => {
    const incident = await createIncident.mutateAsync(values)
    navigate(`/incidents/${incident.id}`)
  }

  return (
    <section>
      <PageHeader
        title="Registrar incidente de seguridad"
        description="Ubica el riesgo en el mapa, define el nivel y si bloquea el desplazamiento del personal hacia los sitios de trabajo."
        actions={
          <Link to={ROUTES.incidents}>
            <Button variant="secondary">Volver al listado</Button>
          </Link>
        }
      />

      <Card padding="lg">
        <IncidentForm onSubmit={handleSubmit} isSubmitting={createIncident.isPending} />
      </Card>
    </section>
  )
}
