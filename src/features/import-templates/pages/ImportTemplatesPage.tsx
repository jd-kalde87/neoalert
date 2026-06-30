import { Link, useParams } from 'react-router-dom'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { TemplateForm } from '../components/TemplateForm'
import { TemplateList } from '../components/TemplateList'
import {
  useCreateImportTemplate,
  useImportTemplateDetail,
  useImportTemplatesList,
  useUpdateImportTemplate,
} from '../hooks/useImportTemplates'

export function ImportTemplatesPage() {
  const { data, isLoading, isError, refetch } = useImportTemplatesList()

  return (
    <section>
      <PageHeader
        title="Plantillas de importación"
        description="Defina estructuras de carga masiva, versionado y activación por entidad operativa."
        actions={
          <Link to={ROUTES.importTemplateNew}>
            <Button>Nueva plantilla</Button>
          </Link>
        }
      />

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        loadingTitle="Cargando plantillas"
        errorTitle="No se pudieron cargar las plantillas"
        onRetry={() => refetch()}
      >
        <TemplateList templates={data ?? []} />
      </AsyncBoundary>
    </section>
  )
}

export function ImportTemplateCreatePage() {
  const createTemplate = useCreateImportTemplate()

  return (
    <section>
      <PageHeader
        title="Nueva plantilla"
        description="Configure campos obligatorios y la entidad destino de la importación."
        actions={
          <Link to={ROUTES.importTemplates}>
            <Button variant="secondary" size="sm">
              Volver
            </Button>
          </Link>
        }
      />
      <Card padding="lg">
        <TemplateForm
          onSubmit={async (payload) => {
            await createTemplate.mutateAsync(payload)
          }}
          isSubmitting={createTemplate.isPending}
        />
      </Card>
    </section>
  )
}

export function ImportTemplateEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useImportTemplateDetail(id)
  const updateTemplate = useUpdateImportTemplate(id ?? '')

  return (
    <section>
      <PageHeader
        title="Editar plantilla"
        description="Los cambios generan una nueva versión de la plantilla."
        actions={
          <Link to={ROUTES.importTemplates}>
            <Button variant="secondary" size="sm">
              Volver
            </Button>
          </Link>
        }
      />
      <Card padding="lg">
        <AsyncBoundary
          isLoading={isLoading}
          isError={isError || !id}
          loadingTitle="Cargando plantilla"
          errorTitle="Plantilla no encontrada"
          onRetry={() => refetch()}
        >
          {data ? (
            <TemplateForm
              initial={data}
              onSubmit={async (payload) => {
                await updateTemplate.mutateAsync(payload)
              }}
              isSubmitting={updateTemplate.isPending}
            />
          ) : null}
        </AsyncBoundary>
      </Card>
    </section>
  )
}
