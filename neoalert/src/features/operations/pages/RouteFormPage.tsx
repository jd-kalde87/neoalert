import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { ROUTES } from '@shared/constants/routes'
import {
  useOperationsBootstrap,
  usePlantOptions,
  useWorkSiteSelectOptions,
} from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import type { RouteCoordinate } from '@shared/types/operations.types'
import { ROUTE_COLOR_PRESETS } from '@shared/types/operations.types'
import { cn } from '@shared/utils/cn'
import { RouteMapEditor } from '../components/RouteMapEditor'

export function RouteFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const route = useOperationsStore((state) => state.routes.find((item) => item.id === id))
  const plants = useOperationsStore((state) => state.plants)
  const workSites = useOperationsStore((state) => state.workSites)
  const createRoute = useOperationsStore((state) => state.createRoute)
  const updateRoute = useOperationsStore((state) => state.updateRoute)

  const plantOptions = usePlantOptions()
  const siteOptions = useWorkSiteSelectOptions()

  const [name, setName] = useState(route?.name ?? '')
  const [plantId, setPlantId] = useState(route?.plantId ?? plantOptions[0]?.value ?? '')
  const [workSiteId, setWorkSiteId] = useState(route?.workSiteId ?? siteOptions[0]?.value ?? '')
  const [color, setColor] = useState(route?.color ?? ROUTE_COLOR_PRESETS[0])
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(route?.estimatedMinutes ?? ''))
  const [active, setActive] = useState(route?.active ?? true)
  const [coordinates, setCoordinates] = useState<RouteCoordinate[]>(route?.coordinates ?? [])
  const [roadSnapped, setRoadSnapped] = useState(route?.roadSnapped ?? false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlant = useMemo(
    () => plants.find((item) => item.id === plantId),
    [plants, plantId],
  )
  const selectedSite = useMemo(
    () => workSites.find((item) => item.id === workSiteId),
    [workSites, workSiteId],
  )

  const handleRouteCalculated = useCallback(
    (payload: { coordinates: RouteCoordinate[]; estimatedMinutes: number; roadSnapped: boolean }) => {
      setCoordinates(payload.coordinates)
      setRoadSnapped(payload.roadSnapped)
      setEstimatedMinutes(String(payload.estimatedMinutes))
    },
    [],
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!plantId || !workSiteId) {
      setError('Seleccione planta y punto de trabajo.')
      return
    }
    if (coordinates.length < 2) {
      setError('Trace la ruta en el mapa usando «Trazar por vías mapeadas».')
      return
    }

    const payload = {
      name,
      plantId,
      workSiteId,
      color,
      coordinates,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      active,
      roadSnapped,
    }

    try {
      if (isEdit && id) {
        updateRoute(id, payload)
      } else {
        createRoute(payload)
      }
      navigate(`${ROUTES.operations}?tab=routes`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la ruta')
    }
  }

  if (isEdit && !route) {
    return (
      <section>
        <PageHeader title="Ruta no encontrada" />
        <Link to={ROUTES.operations}>
          <Button variant="secondary">Volver</Button>
        </Link>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        title={isEdit ? 'Editar ruta operativa' : 'Nueva ruta operativa'}
        description="Defina origen y destino, luego trace el corredor sobre la red vial (OpenStreetMap + OSRM)."
        actions={
          <Link to={`${ROUTES.operations}?tab=routes`}>
            <Button variant="secondary" size="sm">
              Cancelar
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,20rem)_1fr]">
        <Card padding="lg">
          <form className="neo-form-stack" onSubmit={handleSubmit}>
            {error ? <p className="neo-alert-error m-0">{error}</p> : null}
            <Input label="Nombre" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select label="Planta origen" name="plantId" value={plantId} options={plantOptions} onChange={setPlantId} />
            <Select
              label="Punto destino"
              name="workSiteId"
              value={workSiteId}
              options={siteOptions}
              onChange={setWorkSiteId}
            />
            <div>
              <span className="mb-2 block text-xs font-medium text-slate-600">Color en mapa</span>
              <div className="flex flex-wrap gap-2">
                {ROUTE_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={cn(
                      'size-8 rounded-full border-2 transition-transform hover:scale-110',
                      color === preset ? 'border-slate-900 ring-2 ring-slate-300' : 'border-white shadow-sm',
                    )}
                    style={{ background: preset }}
                    onClick={() => setColor(preset)}
                    aria-label={`Color ${preset}`}
                  />
                ))}
              </div>
            </div>
            <Input
              label="Tiempo estimado (min)"
              name="estimatedMinutes"
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Activa
            </label>
            <Button type="submit">{isEdit ? 'Guardar ruta' : 'Crear ruta'}</Button>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="neo-section-title mb-3">Trazado gráfico por vías</h2>
          <RouteMapEditor
            key={`${plantId}-${workSiteId}-${id ?? 'new'}`}
            plantLat={selectedPlant?.latitude ?? null}
            plantLng={selectedPlant?.longitude ?? null}
            siteLat={selectedSite?.latitude ?? null}
            siteLng={selectedSite?.longitude ?? null}
            color={color}
            initialCoordinates={route?.coordinates ?? []}
            initialRoadSnapped={route?.roadSnapped ?? false}
            excludeRouteId={id}
            onRouteCalculated={handleRouteCalculated}
          />
        </Card>
      </div>
    </section>
  )
}
