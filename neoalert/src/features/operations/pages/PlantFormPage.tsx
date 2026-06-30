import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Textarea } from '@shared/components/ui/Textarea'
import { ROUTES } from '@shared/constants/routes'
import { useOperationsBootstrap, usePrimaryPlant } from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import { GraphicPointPicker } from '../components/OperationMapEditors'

export function PlantFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const primaryPlant = usePrimaryPlant()

  const plant = useOperationsStore((state) => state.plants.find((item) => item.id === id))
  const createPlant = useOperationsStore((state) => state.createPlant)
  const updatePlant = useOperationsStore((state) => state.updatePlant)

  const [name, setName] = useState(plant?.name ?? '')
  const [description, setDescription] = useState(plant?.description ?? '')
  const [address, setAddress] = useState(plant?.address ?? '')
  const [latitude, setLatitude] = useState<number | null>(plant?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(plant?.longitude ?? null)
  const [isPrimary, setIsPrimary] = useState(plant?.isPrimary ?? !primaryPlant)
  const [active, setActive] = useState(plant?.active ?? true)
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
      setError('Ubique la planta en el mapa.')
      return
    }

    const payload = {
      name,
      description,
      address,
      latitude,
      longitude,
      isPrimary,
      active,
    }

    if (isEdit && id) {
      updatePlant(id, payload)
    } else {
      createPlant(payload)
    }

    navigate(`${ROUTES.operations}?tab=plants`)
  }

  if (isEdit && !plant) {
    return (
      <section>
        <PageHeader title="Planta no encontrada" />
        <Link to={ROUTES.operations}>
          <Button variant="secondary">Volver</Button>
        </Link>
      </section>
    )
  }

  const mapDefault: [number, number] = primaryPlant
    ? [primaryPlant.latitude, primaryPlant.longitude]
    : [4.695, -74.13]

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Editar planta' : 'Nueva planta'}
        description="Ubique la planta sobre el mapa (vías OpenStreetMap). Arrastre el marcador o haga clic."
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
            <Textarea label="Descripción" name="description" value={description} onChange={setDescription} rows={2} />
            <Input label="Dirección" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              Planta principal
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Activa
            </label>
            <Button type="submit">{isEdit ? 'Guardar cambios' : 'Crear planta'}</Button>
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
            hint="Clic en el mapa para colocar la planta. Se muestran plantas, sitios y rutas ya registrados."
            defaultCenter={mapDefault}
            excludePlantId={id}
          />
        </Card>
      </div>
    </section>
  )
}
