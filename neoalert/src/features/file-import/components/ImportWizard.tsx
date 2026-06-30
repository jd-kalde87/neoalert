import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Select } from '@shared/components/ui/Select'
import { ROUTES } from '@shared/constants/routes'
import { useImportTemplates, useStartImport } from '../hooks/useImports'
import type { ImportColumnMapping } from '../types/import.types'
import { parseImportFile, suggestMappings } from '../utils/parseFile'
import {
  IMPORT_FILE_ACCEPT,
  importFileTypeLabel,
  isAcceptedImportFile,
} from '@shared/constants/import-files'
import { ColumnMapper } from './ColumnMapper'
import { ImportPreviewTable } from './ImportPreviewTable'

type WizardStep = 'upload' | 'preview' | 'mapping' | 'confirm'

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Archivo' },
  { id: 'preview', label: 'Vista previa' },
  { id: 'mapping', label: 'Mapeo' },
  { id: 'confirm', label: 'Confirmar' },
]

export function ImportWizard() {
  const navigate = useNavigate()
  const { data: templates = [] } = useImportTemplates()
  const startImport = useStartImport()

  const [step, setStep] = useState<WizardStep>('upload')
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [templateId, setTemplateId] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [mappings, setMappings] = useState<ImportColumnMapping[]>([])
  const [parseError, setParseError] = useState<string | null>(null)

  const activeTemplate = templates.find((item) => item.id === templateId)
  const activeFields = activeTemplate?.fields ?? []

  const templateOptions = useMemo(
    () =>
      templates
        .filter((item) => item.active)
        .map((item) => ({ value: item.id, label: item.name })),
    [templates],
  )

  const stepIndex = STEPS.findIndex((item) => item.id === step)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setParseError(null)
    setFileName(file.name)
    setSelectedFile(file)

    if (!isAcceptedImportFile(file)) {
      setParseError(
        `Formato no soportado. Use ${importFileTypeLabel()}.`,
      )
      return
    }

    try {
      const parsed = await parseImportFile(file)
      if (parsed.headers.length === 0) {
        setParseError('El archivo está vacío o no tiene encabezados válidos.')
        return
      }
      setHeaders(parsed.headers)
      setRows(parsed.rows)
      setTotalRows(parsed.totalRows)
    } catch {
      setParseError(
        `No se pudo leer el archivo. Verifique que sea ${importFileTypeLabel()}.`,
      )
    }
  }

  const goToPreview = () => {
    if (!fileName || headers.length === 0) {
      setParseError(`Seleccione un archivo válido (${importFileTypeLabel()}).`)
      return
    }
    if (!templateId) {
      setParseError('Seleccione una plantilla de importación.')
      return
    }
    setParseError(null)
    setStep('preview')
  }

  const goToMapping = () => {
    if (!activeTemplate) return
    setMappings(
      suggestMappings(headers, activeTemplate.fields).map((mapping) => ({
        ...mapping,
        required: activeTemplate.fields.find((field) => field.key === mapping.targetField)
          ?.required ?? false,
      })),
    )
    setStep('mapping')
  }

  const goToConfirm = () => {
    const missingRequired = activeFields
      .filter((field) => field.required)
      .some((field) => {
        const mapping = mappings.find((item) => item.targetField === field.key)
        return !mapping?.sourceColumn
      })

    if (missingRequired) {
      setParseError('Complete el mapeo de todos los campos obligatorios.')
      return
    }
    setParseError(null)
    setStep('confirm')
  }

  const handleSubmit = async () => {
    if (!activeTemplate) return

    const job = await startImport.mutateAsync({
      fileName,
      templateId: activeTemplate.id,
      headers,
      rows,
      mappings,
      file: selectedFile ?? undefined,
    })

    navigate(ROUTES.importDetail.replace(':id', job.id))
  }

  return (
    <div>
      <ol className="m-0 mb-4 flex list-none flex-wrap gap-3 p-0">
        {STEPS.map((item, index) => (
          <li
            key={item.id}
            className={
              index <= stepIndex
                ? 'rounded-full bg-accent/15 px-3 py-1.5 text-[0.8125rem] font-semibold text-accent'
                : 'rounded-full bg-slate-100 px-3 py-1.5 text-[0.8125rem] text-slate-500'
            }
          >
            {index + 1}. {item.label}
          </li>
        ))}
      </ol>

      {parseError ? (
        <p className="neo-alert-error mb-4" role="alert">
          {parseError}
        </p>
      ) : null}

      {step === 'upload' ? (
        <Card padding="lg">
          <h2 className="neo-section-title">1. Seleccionar archivo y plantilla</h2>
          <div className="my-4 grid gap-4">
            <Select
              label="Plantilla"
              name="templateId"
              value={templateId}
              options={templateOptions}
              placeholder="Elegir plantilla activa"
              onChange={setTemplateId}
            />
            <label className="flex flex-col gap-1.5 text-sm">
              <span>Archivo ({importFileTypeLabel()})</span>
              <input type="file" accept={IMPORT_FILE_ACCEPT} onChange={handleFileChange} />
              {fileName ? <small className="text-slate-500">{fileName}</small> : null}
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={goToPreview}>Continuar</Button>
          </div>
        </Card>
      ) : null}

      {step === 'preview' ? (
        <Card padding="lg">
          <h2 className="neo-section-title">2. Vista previa</h2>
          <ImportPreviewTable headers={headers} rows={rows} totalRows={totalRows} />
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep('upload')}>
              Atrás
            </Button>
            <Button onClick={goToMapping}>Mapear columnas</Button>
          </div>
        </Card>
      ) : null}

      {step === 'mapping' && activeTemplate ? (
        <Card padding="lg">
          <h2 className="neo-section-title">3. Mapeo de columnas — {activeTemplate.name}</h2>
          <ColumnMapper
            headers={headers}
            fields={activeFields}
            mappings={mappings}
            onChange={setMappings}
          />
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep('preview')}>
              Atrás
            </Button>
            <Button onClick={goToConfirm}>Validar mapeo</Button>
          </div>
        </Card>
      ) : null}

      {step === 'confirm' && activeTemplate ? (
        <Card padding="lg">
          <h2 className="neo-section-title">4. Confirmar importación</h2>
          <ul className="my-4 flex list-none flex-col gap-2 p-0">
            <li className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Archivo</span>
              <strong>{fileName}</strong>
            </li>
            <li className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Plantilla</span>
              <strong>{activeTemplate.name}</strong>
            </li>
            <li className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Filas a procesar</span>
              <strong>{totalRows}</strong>
            </li>
            <li className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Campos mapeados</span>
              <strong>{mappings.filter((item) => item.sourceColumn).length}</strong>
            </li>
          </ul>
          <p className="text-[0.8125rem] text-slate-500">
            La validación y carga se ejecutan de forma asíncrona. Podrá descargar el reporte de
            errores desde el detalle.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={() => setStep('mapping')}>
              Atrás
            </Button>
            <Button onClick={handleSubmit} disabled={startImport.isPending}>
              {startImport.isPending ? 'Procesando…' : 'Iniciar importación'}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
