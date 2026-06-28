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

export function suggestMappings(
  headers: string[],
  fields: { key: string; label: string }[],
) {
  return fields.map((field) => {
    const normalized = field.key.toLowerCase()
    const match =
      headers.find((header) => header.toLowerCase().includes(normalized)) ??
      headers.find((header) => header.toLowerCase().includes(field.label.toLowerCase().slice(0, 4)))
    return {
      sourceColumn: match ?? '',
      targetField: field.key,
      required: false,
    }
  })
}
