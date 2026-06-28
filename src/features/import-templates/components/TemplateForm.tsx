import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { ROUTES } from '@shared/constants/routes'
import type { ImportTemplateField, ImportTemplateSummary } from '@features/file-import/types/import.types'
import type { UpsertTemplatePayload } from '../services/templates.api'

const ENTITY_OPTIONS = [
  { value: 'security_incidents', label: 'Incidentes de seguridad' },
  { value: 'attendance', label: 'Asistencia' },
  { value: 'routes', label: 'Rutas y sitios' },
  { value: 'collaborators', label: 'Colaboradores' },
]

interface TemplateFormProps {
  initial?: ImportTemplateSummary
  onSubmit: (payload: UpsertTemplatePayload) => Promise<void>
  isSubmitting?: boolean
}

export function TemplateForm({ initial, onSubmit, isSubmitting }: TemplateFormProps) {
  const navigate = useNavigate()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [entity, setEntity] = useState<ImportTemplateSummary['entity']>(
    initial?.entity ?? 'security_incidents',
  )
  const [active, setActive] = useState(initial?.active ?? true)
  const [fields, setFields] = useState<ImportTemplateField[]>(
    initial?.fields ?? [{ key: '', label: '', required: true }],
  )
  const [error, setError] = useState<string | null>(null)

  const updateField = (index: number, patch: Partial<ImportTemplateField>) => {
    setFields((current) =>
      current.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field)),
    )
  }

  const addField = () => {
    setFields((current) => [...current, { key: '', label: '', required: false }])
  }

  const removeField = (index: number) => {
    setFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const cleanedFields = fields
      .map((field) => ({
        ...field,
        key: field.key.trim(),
        label: field.label.trim(),
      }))
      .filter((field) => field.key && field.label)

    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (cleanedFields.length === 0) {
      setError('Agregue al menos un campo.')
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      entity,
      active,
      fields: cleanedFields,
    })

    navigate(ROUTES.importTemplates)
  }

  return (
    <form className="neo-form-stack max-w-[720px]" onSubmit={handleSubmit}>
      {error ? (
        <p className="neo-alert-error m-0" role="alert">
          {error}
        </p>
      ) : null}

      <Input label="Nombre" name="name" value={name} onChange={(event) => setName(event.target.value)} />
      <Textarea
        label="Descripción"
        name="description"
        value={description}
        onChange={setDescription}
        rows={3}
      />
      <Select
        label="Entidad destino"
        name="entity"
        value={entity}
        options={ENTITY_OPTIONS}
        onChange={(value) => setEntity(value as ImportTemplateSummary['entity'])}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
        Plantilla activa para importaciones
      </label>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="neo-section-title m-0 text-[0.9375rem]">Campos de la plantilla</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addField}>
            Agregar campo
          </Button>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {fields.map((field, index) => (
            <li
              key={index}
              className="grid grid-cols-1 items-end gap-3 rounded-md border border-slate-200 p-3 min-[768px]:grid-cols-[1fr_1fr_auto_auto]"
            >
              <Input
                label="Clave"
                name={`field-key-${index}`}
                value={field.key}
                onChange={(event) => updateField(index, { key: event.target.value })}
              />
              <Input
                label="Etiqueta"
                name={`field-label-${index}`}
                value={field.label}
                onChange={(event) => updateField(index, { label: event.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) => updateField(index, { required: event.target.checked })}
                />
                Obligatorio
              </label>
              {fields.length > 1 ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => removeField(index)}>
                  Quitar
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.importTemplates)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear plantilla'}
        </Button>
      </div>
    </form>
  )
}
