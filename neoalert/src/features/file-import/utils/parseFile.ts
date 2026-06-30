import * as XLSX from 'xlsx'
import {
  getImportFileExtension,
  isAcceptedImportFile,
} from '@shared/constants/import-files'

export function parseDelimitedText(content: string, maxRows = 50) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return { headers: [] as string[], rows: [] as string[][], totalRows: 0 }
  }

  const delimiter = lines[0]?.includes(';') ? ';' : ','
  const headers = lines[0]!.split(delimiter).map((cell) => cell.trim())
  const allRows = lines.slice(1).map((line) => line.split(delimiter).map((cell) => cell.trim()))
  const rows = allRows.slice(0, maxRows)

  return { headers, rows, totalRows: allRows.length }
}

function parseExcelBuffer(buffer: ArrayBuffer, maxRows = 50) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { headers: [] as string[], rows: [] as string[][], totalRows: 0 }
  }

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    return { headers: [] as string[], rows: [] as string[][], totalRows: 0 }
  }

  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  const normalized = matrix
    .map((row) => row.map((cell) => String(cell ?? '').trim()))
    .filter((row) => row.some(Boolean))

  if (normalized.length === 0) {
    return { headers: [] as string[], rows: [] as string[][], totalRows: 0 }
  }

  const headers = normalized[0] ?? []
  const allRows = normalized.slice(1)
  const rows = allRows.slice(0, maxRows)

  return { headers, rows, totalRows: allRows.length }
}

export async function parseImportFile(file: File, maxRows = 50) {
  if (!isAcceptedImportFile(file)) {
    throw new Error('Formato no soportado. Use CSV, TXT, XLS o XLSX.')
  }

  const extension = getImportFileExtension(file.name)

  if (extension === '.xlsx' || extension === '.xls') {
    const buffer = await file.arrayBuffer()
    return parseExcelBuffer(buffer, maxRows)
  }

  const content = await file.text()
  return parseDelimitedText(content, maxRows)
}

const FIELD_HEADER_ALIASES: Record<string, string[]> = {
  A0001: ['fecha'],
  A0002: ['ubicacion', 'ubicación', 'lugar', 'sitio', 'localidad'],
  A0003: ['tipo de operativo', 'tipo de actividad', 'operativo', 'actividad'],
  A0004: ['fuerzas', 'involucrad'],
  A0005: ['detalle', 'aseguramiento', 'resultado'],
  A0006: ['artefacto', 'insumo', 'cantidad'],
  A0007: ['autoridad', 'investigacion', 'investigación'],
  A0008: ['fuente'],
  location: ['ubicacion', 'ubicación', 'lugar', 'sitio', 'direccion', 'dirección', 'punto', 'localidad'],
  latitude: ['lat', 'latitud'],
  longitude: ['lng', 'lon', 'longitud'],
  routeName: ['ruta', 'corredor', 'trayecto'],
  severity: ['riesgo', 'nivel', 'severidad', 'prioridad'],
  title: ['titulo', 'título', 'asunto', 'evento'],
  type: ['tipo', 'categoria', 'categoría'],
}

export function suggestMappings(
  headers: string[],
  fields: { key: string; label: string }[],
) {
  return fields.map((field) => {
    const normalized = field.key.toLowerCase()
    const aliases = FIELD_HEADER_ALIASES[field.key] ?? []
    const match =
      headers.find((header) => header.toLowerCase().includes(normalized)) ??
      headers.find((header) =>
        aliases.some((alias) => header.toLowerCase().includes(alias)),
      ) ??
      headers.find((header) => header.toLowerCase().includes(field.label.toLowerCase().slice(0, 4)))
    return {
      sourceColumn: match ?? '',
      targetField: field.key,
      required: false,
    }
  })
}
