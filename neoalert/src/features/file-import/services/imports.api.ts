import type {
  ImportJob,
  ImportTemplateSummary,
  StartImportPayload,
} from '../types/import.types'
import {
  fetchTemplateById,
  fetchTemplates,
} from '@features/import-templates/services/templates.api'
import { USE_MOCK_API } from '@shared/config/api.config'
import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import { publishSecurityIncidentRows } from '../utils/publishImportRows'
import {
  getCanonicalImportValue,
  importMappingsIncludeLocation,
  shouldPublishImportAsIncidents,
} from '../utils/resolveImportField'

let jobsDb: ImportJob[] = []

export async function fetchImportTemplates() {
  return fetchTemplates()
}

export async function fetchImportTemplate(id: string) {
  return fetchTemplateById(id)
}

export async function fetchImportJobs() {
  if (!USE_MOCK_API) {
    return authorizedRequest<ImportJob[]>(API_ENDPOINTS.imports.list)
  }

  await new Promise((resolve) => setTimeout(resolve, 300))
  return jobsDb.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
}

export async function fetchImportJob(id: string) {
  if (!USE_MOCK_API) {
    return authorizedRequest<ImportJob>(API_ENDPOINTS.imports.detail(id))
  }

  await new Promise((resolve) => setTimeout(resolve, 250))
  const job = jobsDb.find((item) => item.id === id)
  if (!job) throw new Error('Importación no encontrada')
  return job
}

export async function uploadImportFile(file: File) {
  if (!USE_MOCK_API) {
    const formData = new FormData()
    formData.append('file', file)

    return authorizedRequest<ImportJob>(API_ENDPOINTS.imports.upload, {
      method: 'POST',
      body: formData,
    })
  }

  await new Promise((resolve) => setTimeout(resolve, 400))

  const job: ImportJob = {
    id: crypto.randomUUID(),
    fileName: file.name,
    templateName: 'Pendiente de mapeo',
    templateId: 'pending',
    status: 'processing',
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Usuario NeoAlert',
    mappings: [],
    errors: [],
  }

  jobsDb = [job, ...jobsDb]
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

    if (rowValid && shouldPublishImportAsIncidents(template.entity, payload.mappings)) {
      const hasCoords =
        Boolean(getCanonicalImportValue(row, payload.headers, payload.mappings, 'latitude')) &&
        Boolean(getCanonicalImportValue(row, payload.headers, payload.mappings, 'longitude'))
      const hasLocation =
        Boolean(getCanonicalImportValue(row, payload.headers, payload.mappings, 'location')) ||
        importMappingsIncludeLocation(payload.mappings)
      if (!hasCoords && !hasLocation) {
        rowValid = false
        errors.push({
          row: rowNum,
          field: 'location',
          message: 'Indica ubicación (nombre/lugar) o coordenadas lat/lng',
        })
      }
    }

    if (rowValid) validRows += 1
  })

  return { validRows, errors }
}

export async function startImportJob(payload: StartImportPayload, uploadedBy: string) {
  const template = await fetchTemplateById(payload.templateId)
  const { validRows, errors: validationErrors } = validateRows(payload, template)

  let publishErrors: ImportJob['errors'] = []
  let publishedCount = 0

  if (validRows > 0 && shouldPublishImportAsIncidents(template.entity, payload.mappings)) {
    const publishResult = await publishSecurityIncidentRows(
      {
        headers: payload.headers,
        rows: payload.rows,
        mappings: payload.mappings,
      },
      template,
      uploadedBy,
    )
    publishedCount = publishResult.created
    publishErrors = publishResult.errors
  }

  const allErrors = [...validationErrors, ...publishErrors].slice(0, 30)
  const errorRows = payload.rows.length - publishedCount
  const status =
    publishedCount === 0 ? 'failed' : allErrors.length > 0 ? 'partial' : 'completed'

  if (!USE_MOCK_API) {
    if (payload.file) {
      await uploadImportFile(payload.file)
    }

    const { fileName, templateId, headers, rows, mappings } = payload

    return authorizedRequest<ImportJob>(API_ENDPOINTS.imports.list, {
      method: 'POST',
      body: {
        fileName,
        templateId,
        headers,
        rows,
        mappings,
        publishedCount,
        errors: allErrors,
        status,
        validRows: publishedCount,
        errorRows,
      },
    })
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  const job: ImportJob = {
    id: crypto.randomUUID(),
    fileName: payload.fileName,
    templateName: template.name,
    templateId: template.id,
    status,
    totalRows: payload.rows.length,
    validRows: publishedCount,
    errorRows,
    uploadedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    uploadedBy,
    mappings: payload.mappings,
    errors: allErrors,
  }

  jobsDb = [job, ...jobsDb]
  return job
}
