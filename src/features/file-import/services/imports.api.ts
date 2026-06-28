import type {
  ImportJob,
  ImportTemplateSummary,
  StartImportPayload,
} from '../types/import.types'
import {
  fetchTemplateById,
  fetchTemplates,
} from '@features/import-templates/services/templates.api'

let jobsDb: ImportJob[] = [
  {
    id: 'imp-001',
    fileName: 'incidentes_junio.csv',
    templateName: 'Incidentes de seguridad',
    templateId: 'tpl-incidents',
    status: 'partial',
    totalRows: 120,
    validRows: 108,
    errorRows: 12,
    uploadedAt: '2026-06-27T16:30:00Z',
    completedAt: '2026-06-27T16:32:00Z',
    uploadedBy: 'Admin NeoAlert',
    mappings: [
      { sourceColumn: 'titulo', targetField: 'title', required: true },
      { sourceColumn: 'tipo', targetField: 'type', required: true },
    ],
    errors: [
      { row: 14, field: 'latitude', message: 'Latitud inválida' },
      { row: 27, field: 'severity', message: 'Nivel de riesgo no reconocido' },
    ],
  },
  {
    id: 'imp-002',
    fileName: 'marcaciones_semana.csv',
    templateName: 'Marcaciones de asistencia',
    templateId: 'tpl-attendance',
    status: 'completed',
    totalRows: 340,
    validRows: 340,
    errorRows: 0,
    uploadedAt: '2026-06-26T11:00:00Z',
    completedAt: '2026-06-26T11:03:00Z',
    uploadedBy: 'María López',
    mappings: [],
    errors: [],
  },
]

export async function fetchImportTemplates() {
  return fetchTemplates()
}

export async function fetchImportTemplate(id: string) {
  return fetchTemplateById(id)
}

export async function fetchImportJobs() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return jobsDb.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
}

export async function fetchImportJob(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const job = jobsDb.find((item) => item.id === id)
  if (!job) throw new Error('Importación no encontrada')
  return job
}

function validateRows(payload: StartImportPayload, template: ImportTemplateSummary) {
  const errors: ImportJob['errors'] = []
  let validRows = 0

  payload.rows.forEach((row, index) => {
    const rowNum = index + 2
    let rowValid = true

    template.fields
      .filter((field) => field.required)
      .forEach((field) => {
        const mapping = payload.mappings.find((item) => item.targetField === field.key)
        if (!mapping) {
          rowValid = false
          errors.push({ row: rowNum, field: field.key, message: 'Campo obligatorio sin mapear' })
          return
        }
        const colIndex = payload.headers.indexOf(mapping.sourceColumn)
        const value = colIndex >= 0 ? row[colIndex]?.trim() : ''
        if (!value) {
          rowValid = false
          errors.push({ row: rowNum, field: field.key, message: `${field.label} vacío` })
        }
      })

    if (rowValid) validRows += 1
  })

  return { validRows, errors }
}

export async function startImportJob(payload: StartImportPayload, uploadedBy: string) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const template = await fetchTemplateById(payload.templateId)

  const { validRows, errors } = validateRows(payload, template)
  const errorRows = payload.rows.length - validRows

  const job: ImportJob = {
    id: crypto.randomUUID(),
    fileName: payload.fileName,
    templateName: template.name,
    templateId: template.id,
    status:
      errorRows === 0 ? 'completed' : validRows > 0 ? 'partial' : 'failed',
    totalRows: payload.rows.length,
    validRows,
    errorRows,
    uploadedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    uploadedBy,
    mappings: payload.mappings,
    errors: errors.slice(0, 20),
  }

  jobsDb = [job, ...jobsDb]
  return job
}
