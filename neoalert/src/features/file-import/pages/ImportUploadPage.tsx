import { Link } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { ROUTES } from '@shared/constants/routes'
import { ImportWizard } from '../components/ImportWizard'

export function ImportUploadPage() {
  return (
    <section>
      <PageHeader
        title="Nueva importación"
        description="Suba CSV, TXT o Excel (.xlsx/.xls), revise la vista previa, mapee columnas y confirme la carga."
        actions={
          <Link to={ROUTES.imports}>
            <Button variant="secondary" size="sm">
              Volver al historial
            </Button>
          </Link>
        }
      />
      <ImportWizard />
    </section>
  )
}
