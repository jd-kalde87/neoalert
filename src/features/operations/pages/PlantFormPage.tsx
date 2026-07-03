import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { COUNTRY_OPTIONS } from '@shared/constants/filter-options'
import { ROUTES } from '@shared/constants/routes'
import { usePrimaryProject } from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import { GraphicPointPicker } from '../components/OperationMapEditors'

export function PlantFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const primaryProject = usePrimaryProject()

  const project = useOperationsStore((state) => state.projects.find((item) => item.id === id))
  const createProject = useOperationsStore((state) => state.createProject)
  const updateProject = useOperationsStore((state) => state.updateProject)

  const [name, setName] = useState(project?.name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [address, setAddress] = useState(project?.address ?? '')
  const [countryCode, setCountryCode] = useState(project?.countryCode ?? 'CO')
  const [latitude, setLatitude] = useState<number | null>(project?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(project?.longitude ?? null)
  const [isPrimary, setIsPrimary] = useState(project?.isPrimary ?? !primaryProject)
  const [active, setActive] = useState(project?.active ?? true)
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
    if (latitude == null || longitude == null) {
      setError('Ubique el proyecto en el mapa.')
      return
    }

    const payload = {
      name,
      description,
      address,
      countryCode,
      latitude,
      longitude,
      isPrimary,
      active,
    }

    if (isEdit && id) {
      updateProject(id, payload)
    } else {
      createProject(payload)
    }

    navigate(`${ROUTES.operations}?tab=plants`)
  }

  if (isEdit && !project) {
    return (
      <section>
        <PageHeader title="Proyecto no encontrado" />
        <Link to={ROUTES.operations}>
          <Button variant="secondary">Volver</Button>
        </Link>
      </section>
    )
  }

  const mapDefault: [number, number] = primaryProject
    ? [primaryProject.latitude, primaryProject.longitude]
    : [10, -25]

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
        description="Ubique el proyecto sobre el mapa. Arrastre el marcador o haga clic."
        actions={
          <Link to={`${ROUTES.operations}?tab=plants`}>
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
              label="País"
              name="countryCode"
              value={countryCode}
              options={COUNTRY_OPTIONS}
              onChange={setCountryCode}
            />
            <Textarea label="Descripción" name="description" value={description} onChange={setDescription} rows={2} />
            <Input label="Dirección" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              Proyecto principal
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Activo
            </label>
            <Button type="submit">{isEdit ? 'Guardar cambios' : 'Crear proyecto'}</Button>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="neo-section-title mb-3">Ubicación gráfica</h2>
          <GraphicPointPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleMapChange}
            markerLabel="P"
            markerColor="#1e3a5f"
            hint="Clic en el mapa para colocar el proyecto."
            defaultCenter={mapDefault}
            excludeProjectId={id}
          />
        </Card>
      </div>
    </section>
  )
}
