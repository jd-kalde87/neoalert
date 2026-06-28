import { Link } from 'react-router-dom'
import { Badge } from '@shared/components/ui/Badge'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import type { ImportTemplateSummary } from '@features/file-import/types/import.types'

const ENTITY_LABELS: Record<ImportTemplateSummary['entity'], string> = {
  security_incidents: 'Incidentes de seguridad',
  attendance: 'Asistencia',
  routes: 'Rutas y sitios',
  collaborators: 'Colaboradores',
}

interface TemplateListProps {
  templates: ImportTemplateSummary[]
}

export function TemplateList({ templates }: TemplateListProps) {
  if (templates.length === 0) {
    return <p className="text-sm text-slate-500">No hay plantillas configuradas.</p>
  }

  return (
    <div className="neo-card-grid">
      {templates.map((template) => (
        <Card key={template.id} padding="lg">
          <div className="mb-3 flex justify-between gap-3">
            <div>
              <h2 className="m-0 text-base">{template.name}</h2>
              <p className="mt-1.5 text-sm text-slate-500">{template.description}</p>
            </div>
            <Badge variant={template.active ? 'success' : 'default'}>
              {template.active ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
          <ul className="m-0 mb-3 grid list-none grid-cols-2 gap-2 p-0 text-[0.8125rem]">
            <li className="flex flex-col gap-0.5">
              <span className="text-slate-500">Entidad</span>
              <strong>{ENTITY_LABELS[template.entity]}</strong>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-slate-500">Versión</span>
              <strong>v{template.version}</strong>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-slate-500">Campos</span>
              <strong>{template.fields.length}</strong>
            </li>
            <li className="flex flex-col gap-0.5">
              <span className="text-slate-500">Actualizada</span>
              <strong>{new Date(template.updatedAt).toLocaleDateString('es-CO')}</strong>
            </li>
          </ul>
          <Link
            to={ROUTES.importTemplateDetail.replace(':id', template.id)}
            className="text-sm font-medium text-accent no-underline hover:text-accent-hover hover:underline"
          >
            Editar plantilla →
          </Link>
        </Card>
      ))}
    </div>
  )
}
