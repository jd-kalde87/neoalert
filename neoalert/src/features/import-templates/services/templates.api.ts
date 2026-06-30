import type { ImportTemplateSummary } from '@features/file-import/types/import.types'
import { USE_MOCK_API } from '@shared/config/api.config'
import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'

const SEED_TEMPLATES: ImportTemplateSummary[] = [
  {
    id: 'tpl-concordia-ops',
    name: 'Operativos de seguridad — Concordia (Sinaloa)',
    description:
      'Plantilla para actividades y operativos con ubicación por nombre (México 40, La Guayanera, La Capilla, etc.)',
    version: '1.0',
    active: true,
    entity: 'security_incidents',
    updatedAt: '2026-06-28T12:00:00Z',
    fields: [
      { key: 'A0001', label: 'Fecha del incidente o registro', required: false },
      { key: 'A0002', label: 'Ubicación específica', required: true },
      { key: 'A0003', label: 'Tipo de operativo o actividad', required: true },
      { key: 'A0004', label: 'Fuerzas de seguridad involucradas', required: false },
      { key: 'A0005', label: 'Detalle de aseguramiento o resultados', required: false },
      { key: 'A0006', label: 'Cantidad de artefactos o insumos', required: false },
      { key: 'A0007', label: 'Autoridad a cargo de la investigación', required: false },
      { key: 'A0008', label: 'Fuente', required: false },
    ],
  },
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
      { key: 'location', label: 'Ubicación / lugar', required: false },
      { key: 'latitude', label: 'Latitud', required: false },
      { key: 'longitude', label: 'Longitud', required: false },
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
  if (!USE_MOCK_API) {
    return authorizedRequest<ImportTemplateSummary[]>(API_ENDPOINTS.importTemplates.list)
  }

  await new Promise((resolve) => setTimeout(resolve, 200))
  return templatesDb
}

export async function fetchTemplateById(id: string) {
  if (!USE_MOCK_API) {
    return authorizedRequest<ImportTemplateSummary>(API_ENDPOINTS.importTemplates.detail(id))
  }

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
  if (!USE_MOCK_API) {
    return authorizedRequest<ImportTemplateSummary>(API_ENDPOINTS.importTemplates.list, {
      method: 'POST',
      body: payload,
    })
  }

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
  if (!USE_MOCK_API) {
    return authorizedRequest<ImportTemplateSummary>(API_ENDPOINTS.importTemplates.detail(id), {
      method: 'PUT',
      body: payload,
    })
  }

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
