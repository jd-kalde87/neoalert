export const IMPORT_ACCEPTED_EXTENSIONS = ['.csv', '.txt', '.xlsx', '.xls'] as const

export const IMPORT_ACCEPTED_MIME_TYPES = [
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

export const IMPORT_FILE_ACCEPT = [
  ...IMPORT_ACCEPTED_EXTENSIONS,
  ...IMPORT_ACCEPTED_MIME_TYPES,
].join(',')

export function getImportFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex < 0) return ''
  return fileName.slice(dotIndex).toLowerCase()
}

export function isAcceptedImportFile(file: File): boolean {
  const extension = getImportFileExtension(file.name)
  if (IMPORT_ACCEPTED_EXTENSIONS.includes(extension as (typeof IMPORT_ACCEPTED_EXTENSIONS)[number])) {
    return true
  }

  if (file.type && IMPORT_ACCEPTED_MIME_TYPES.includes(file.type as (typeof IMPORT_ACCEPTED_MIME_TYPES)[number])) {
    return true
  }

  return false
}

export const IMPORT_SUPPORTED_FORMATS_LABEL = 'CSV, TXT, XLS o XLSX'

export function importFileTypeLabel(fileName?: string): string {
  if (!fileName) return IMPORT_SUPPORTED_FORMATS_LABEL

  const extension = getImportFileExtension(fileName)
  if (extension === '.xlsx' || extension === '.xls') return 'Excel'
  if (extension === '.csv') return 'CSV'
  if (extension === '.txt') return 'texto delimitado'
  return 'archivo'
}
