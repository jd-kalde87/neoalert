import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Textarea'
import { ZONE_OPTIONS } from '@shared/constants/filter-options'
import { ROUTES } from '@shared/constants/routes'
import { usePrimaryPlant } from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import { GraphicPointPicker } from '../components/OperationMapEditors'

export function WorkSiteFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const primaryPlant = usePrimaryPlant()

  const site = useOperationsStore((state) => state.workSites.find((item) => item.id === id))
  const createWorkSite = useOperationsStore((state) => state.createWorkSite)
  const updateWorkSite = useOperationsStore((state) => state.updateWorkSite)

  const [name, setName] = useState(site?.name ?? '')
  const [zoneId, setZoneId] = useState(site?.zoneId ?? ZONE_OPTIONS[0]?.value ?? '')
  const [description, setDescription] = useState(site?.description ?? '')
  const [latitude, setLatitude] = useState<number | null>(site?.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(site?.longitude ?? null)
  const [active, setActive] = useState(site?.active ?? true)
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
    if (!zoneId) {
      setError('Seleccione un corredor.')
      return
    }
    if (latitude == null || longitude == null) {
      setError('Ubique el punto de trabajo en el mapa.')
      return
    }

    const payload = { name, zoneId, description, latitude, longitude, active }

    if (isEdit && id) {
      updateWorkSite(id, payload)
    } else {
      createWorkSite(payload)
    }

    navigate(`${ROUTES.operations}?tab=sites`)
  }

  if (isEdit && !site) {
    return (
      <section>
        <PageHeader title="Punto no encontrado" />
        <Link to={ROUTES.operations}>
          <Button variant="secondary">Volver</Button>
        </Link>
      </section>
    )
  }

  const mapDefault: [number, number] = primaryPlant
    ? [primaryPlant.latitude + 0.05, primaryPlant.longitude + 0.05]
    : [4.78, -74.02]

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Editar punto de trabajo' : 'Nuevo punto de trabajo'}
        description="Marque el sitio sobre el mapa junto a las vías de acceso."
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
            <Select label="Corredor" name="zoneId" value={zoneId} options={ZONE_OPTIONS} onChange={setZoneId} />
            <Textarea label="Descripción" name="description" value={description} onChange={setDescription} rows={2} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Activo
            </label>
            <Button type="submit">{isEdit ? 'Guardar cambios' : 'Crear punto'}</Button>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="neo-section-title mb-3">Ubicación gráfica</h2>
          <GraphicPointPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleMapChange}
            markerLabel="S"
            markerColor="#059669"
            hint="Clic o arrastre para ubicar el sitio de trabajo."
            defaultCenter={mapDefault}
            excludeSiteId={id}
          />
        </Card>
      </div>
    </section>
  )
}
