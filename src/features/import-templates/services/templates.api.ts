import type { ImportTemplateSummary } from '@features/file-import/types/import.types'

const SEED_TEMPLATES: ImportTemplateSummary[] = [
  {
    id: 'tpl-incidents',
    name: 'Incidentes de seguridad',
    description: 'Carga masiva de incidentes en rutas operativas',
    version: '2.1',
    active: true,
    entity: 'security_incidents',
    updatedAt: '2026-06-20T10:00:00Z',
    fields: [
      { key: 'title', label: 'Título', required: true },
      { key: 'type', label: 'Tipo incidente', required: true },
      { key: 'severity', label: 'Nivel riesgo', required: true },
      { key: 'routeName', label: 'Ruta afectada', required: true },
      { key: 'latitude', label: 'Latitud', required: true },
      { key: 'longitude', label: 'Longitud', required: true },
      { key: 'blocksTransit', label: 'Bloquea tránsito', required: false },
    ],
  },
  {
    id: 'tpl-attendance',
    name: 'Marcaciones de asistencia',
    description: 'Importación de historial de marcaciones en ruta',
    version: '1.4',
    active: true,
    entity: 'attendance',
    updatedAt: '2026-06-18T14:00:00Z',
    fields: [
      { key: 'userName', label: 'Colaborador', required: true },
      { key: 'markType', label: 'Tipo marcación', required: true },
      { key: 'routeName', label: 'Ruta', required: true },
      { key: 'markedAt', label: 'Fecha/hora', required: true },
    ],
  },
  {
    id: 'tpl-routes',
    name: 'Rutas y sitios',
    description: 'Actualización de corredores planta → sitios',
    version: '1.0',
    active: false,
    entity: 'routes',
    updatedAt: '2026-06-10T09:00:00Z',
    fields: [
      { key: 'routeName', label: 'Nombre ruta', required: true },
      { key: 'siteName', label: 'Sitio destino', required: true },
      { key: 'zoneId', label: 'Corredor', required: true },
    ],
  },
]

let templatesDb = [...SEED_TEMPLATES]

export async function fetchTemplates() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return templatesDb
}

export async function fetchTemplateById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const template = templatesDb.find((item) => item.id === id)
  if (!template) throw new Error('Plantilla no encontrada')
  return template
}

export interface UpsertTemplatePayload {
  name: string
  description: string
  entity: ImportTemplateSummary['entity']
  active: boolean
  fields: ImportTemplateSummary['fields']
}

export async function createTemplate(payload: UpsertTemplatePayload) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const template: ImportTemplateSummary = {
    id: crypto.randomUUID(),
    name: payload.name,
    description: payload.description,
    version: '1.0',
    active: payload.active,
    entity: payload.entity,
    fields: payload.fields,
    updatedAt: new Date().toISOString(),
  }

  templatesDb = [template, ...templatesDb]
  return template
}

export async function updateTemplate(id: string, payload: UpsertTemplatePayload) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const index = templatesDb.findIndex((item) => item.id === id)
  if (index < 0) throw new Error('Plantilla no encontrada')

  const current = templatesDb[index]!
  const [major] = current.version.split('.').map(Number)
  const nextVersion = `${major + 1}.0`

  const updated: ImportTemplateSummary = {
    ...current,
    ...payload,
    version: nextVersion,
    updatedAt: new Date().toISOString(),
  }

  templatesDb = templatesDb.map((item) => (item.id === id ? updated : item))
  return updated
}
