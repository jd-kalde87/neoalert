import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { COUNTRY_OPTIONS, MUNICIPALITY_OPTIONS } from '@shared/constants/filter-options'
import { ROUTES } from '@shared/constants/routes'
import { usePrimaryProject, useProjectOptions } from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import { GraphicPointPicker } from '../components/OperationMapEditors'

export function WorkSiteFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const primaryProject = usePrimaryProject()

  const department = useOperationsStore((state) => state.departments.find((item) => item.id === id))
  const createDepartment = useOperationsStore((state) => state.createDepartment)
  const updateDepartment = useOperationsStore((state) => state.updateDepartment)

  const projectOptions = useProjectOptions()

  const [name, setName] = useState(department?.name ?? '')
  const [municipalityId, setMunicipalityId] = useState(
    department?.municipalityId ?? MUNICIPALITY_OPTIONS[0]?.value ?? '',
  )
  const [projectId, setProjectId] = useState(
    department?.projectId ?? projectOptions[0]?.value ?? 'project-main',
  )
  const [countryCode, setCountryCode] = useState(department?.countryCode ?? 'CO')
  const [description, setDescription] = useState(department?.description ?? '')
  const [latitude, setLatitude] = useState<number | null>(department?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(department?.longitude ?? null)
  const [active, setActive] = useState(department?.active ?? true)
  const [error, setError] = useState<string | null>(null)

  const handleMapChange = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!municipalityId) {
      setError('Seleccione un municipio.')
      return
    }
    if (!projectId) {
      setError('Seleccione un proyecto.')
      return
    }
    if (latitude == null || longitude == null) {
      setError('Ubique el departamento en el mapa.')
      return
    }

    const payload = {
      name,
      municipalityId,
      projectId,
      countryCode,
      description,
      latitude,
      longitude,
      active,
    }

    if (isEdit && id) {
      updateDepartment(id, payload)
    } else {
      createDepartment(payload)
    }

    navigate(`${ROUTES.operations}?tab=sites`)
  }

  if (isEdit && !department) {
    return (
      <section>
        <PageHeader title="Departamento no encontrado" />
        <Link to={ROUTES.operations}>
          <Button variant="secondary">Volver</Button>
        </Link>
      </section>
    )
  }

  const mapDefault: [number, number] = primaryProject
    ? [primaryProject.latitude + 0.05, primaryProject.longitude + 0.05]
    : [10, -25]

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Editar departamento' : 'Nuevo departamento'}
        description="Marque el departamento operativo sobre el mapa."
        actions={
          <Link to={`${ROUTES.operations}?tab=sites`}>
            <Button variant="secondary" size="sm">
              Cancelar
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
        <Card padding="lg">
          <form className="neo-form-stack" onSubmit={handleSubmit}>
            {error ? <p className="neo-alert-error m-0">{error}</p> : null}
            <Input label="Nombre" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select
              label="Proyecto"
              name="projectId"
              value={projectId}
              options={projectOptions}
              onChange={setProjectId}
            />
            <Select
              label="País"
              name="countryCode"
              value={countryCode}
              options={COUNTRY_OPTIONS}
              onChange={setCountryCode}
            />
            <Select
              label="Municipio"
              name="municipalityId"
              value={municipalityId}
              options={MUNICIPALITY_OPTIONS}
              onChange={setMunicipalityId}
            />
            <Textarea label="Descripción" name="description" value={description} onChange={setDescription} rows={2} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Activo
            </label>
            <Button type="submit">{isEdit ? 'Guardar cambios' : 'Crear departamento'}</Button>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="neo-section-title mb-3">Ubicación gráfica</h2>
          <GraphicPointPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleMapChange}
            markerLabel="D"
            markerColor="#059669"
            hint="Clic o arrastre para ubicar el departamento."
            defaultCenter={mapDefault}
            excludeDepartmentId={id}
          />
        </Card>
      </div>
    </section>
  )
}
