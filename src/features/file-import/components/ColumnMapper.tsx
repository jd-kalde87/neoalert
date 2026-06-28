import { Select } from '@shared/components/ui/Select'
import type { ImportColumnMapping, ImportTemplateField } from '../types/import.types'

interface ColumnMapperProps {
  headers: string[]
  fields: ImportTemplateField[]
  mappings: ImportColumnMapping[]
  onChange: (mappings: ImportColumnMapping[]) => void
}

export function ColumnMapper({ headers, fields, mappings, onChange }: ColumnMapperProps) {
  const headerOptions = headers.map((header) => ({ value: header, label: header }))

  const updateMapping = (targetField: string, sourceColumn: string) => {
    onChange(
      mappings.map((mapping) =>
        mapping.targetField === targetField ? { ...mapping, sourceColumn } : mapping,
      ),
    )
  }

  return (
    <div>
      <p className="mb-4 text-[0.8125rem] text-slate-500">
        Asocie cada columna del archivo con el campo de la plantilla. Los campos obligatorios deben
        estar mapeados.
      </p>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {fields.map((field) => {
          const mapping = mappings.find((item) => item.targetField === field.key)
          return (
            <li
              key={field.key}
              className="grid grid-cols-1 items-end gap-4 min-[640px]:grid-cols-[1fr_1.2fr]"
            >
              <div className="flex items-center gap-1 text-sm">
                <strong>{field.label}</strong>
                {field.required ? <span className="text-red-600">*</span> : null}
              </div>
              <Select
                label=""
                name={`map-${field.key}`}
                value={mapping?.sourceColumn ?? ''}
                options={headerOptions}
                placeholder="Columna del archivo"
                onChange={(value) => updateMapping(field.key, value)}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
