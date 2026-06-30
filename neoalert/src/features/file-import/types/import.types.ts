export type ImportJobStatus =
  | 'uploaded'
  | 'mapping'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'failed'

export interface ImportColumnMapping {
  sourceColumn: string
  targetField: string
  required: boolean
}

export interface ImportRowError {
  row: number
  field?: string
  message: string
}

export interface ImportJob {
  id: string
  fileName: string
  templateName: string
  templateId: string
  status: ImportJobStatus
  totalRows: number
  validRows: number
  errorRows: number
  uploadedAt: string
  completedAt?: string
  uploadedBy: string
  mappings: ImportColumnMapping[]
  errors: ImportRowError[]
}

export interface ParsedFilePreview {
  headers: string[]
  rows: string[][]
  totalRows: number
}

export interface ImportTemplateField {
  key: string
  label: string
  required: boolean
}

export interface ImportTemplateSummary {
  id: string
  name: string
  description: string
  version: string
  active: boolean
  entity: 'security_incidents' | 'attendance' | 'routes' | 'collaborators'
  fields: ImportTemplateField[]
  updatedAt: string
}

export const IMPORT_STATUS_LABELS: Record<ImportJobStatus, string> = {
  uploaded: 'Subido',
  mapping: 'Mapeo',
  validating: 'Validando',
  processing: 'Procesando',
  completed: 'Completado',
  partial: 'Parcial',
  failed: 'Fallido',
}

export interface StartImportPayload {
  fileName: string
  templateId: string
  headers: string[]
  rows: string[][]
  mappings: ImportColumnMapping[]
  file?: File
}
