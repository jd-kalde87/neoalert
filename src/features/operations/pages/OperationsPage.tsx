import { Link, useSearchParams } from 'react-router-dom'
import { Building2, MapPin, Route } from 'lucide-react'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { ROUTES } from '@shared/constants/routes'
import { zoneLabel } from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import { cn } from '@shared/utils/cn'

type Tab = 'plants' | 'sites' | 'routes'

const TABS: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'plants', label: 'Plantas', icon: Building2 },
  { id: 'sites', label: 'Puntos de trabajo', icon: MapPin },
  { id: 'routes', label: 'Rutas', icon: Route },
]

export function OperationsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'plants'

  const plants = useOperationsStore((state) => state.plants)
  const workSites = useOperationsStore((state) => state.workSites)
  const routes = useOperationsStore((state) => state.routes)
  const deletePlant = useOperationsStore((state) => state.deletePlant)
  const deleteWorkSite = useOperationsStore((state) => state.deleteWorkSite)
  const deleteRoute = useOperationsStore((state) => state.deleteRoute)

  const setTab = (next: Tab) => setParams({ tab: next })

  const handleDeletePlant = (id: string, name: string) => {
    if (!confirm(`¿Eliminar planta "${name}"?`)) return
    try {
      deletePlant(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  const handleDeleteSite = (id: string, name: string) => {
    if (!confirm(`¿Eliminar punto "${name}"?`)) return
    try {
      deleteWorkSite(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  const handleDeleteRoute = (id: string, name: string) => {
    if (!confirm(`¿Eliminar ruta "${name}"?`)) return
    deleteRoute(id)
  }

  return (
    <section>
      <PageHeader
        title="Plantas, puntos y rutas"
        description="Catálogo operativo: plantas de origen, sitios de trabajo y corredores planta → sitio. Los cambios se reflejan en mapas, incidentes y asistencia."
        actions={
          tab === 'plants' ? (
            <Link to={ROUTES.operationsPlantNew}>
              <Button>Nueva planta</Button>
            </Link>
          ) : tab === 'sites' ? (
            <Link to={ROUTES.operationsSiteNew}>
              <Button>Nuevo punto</Button>
            </Link>
          ) : (
            <Link to={ROUTES.operationsRouteNew}>
              <Button>Nueva ruta</Button>
            </Link>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                tab === item.id
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      {tab === 'plants' ? (
        <Card padding="none" className="overflow-hidden">
          <div className="neo-table-wrap border-0 shadow-none">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Coordenadas</th>
                  <th>Principal</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr key={plant.id}>
                    <td>
                      <strong className="block text-slate-900">{plant.name}</strong>
                      {plant.description ? (
                        <span className="text-xs text-slate-500">{plant.description}</span>
                      ) : null}
                    </td>
                    <td className="text-xs tabular-nums text-slate-500">
                      {plant.latitude.toFixed(4)}, {plant.longitude.toFixed(4)}
                    </td>
                    <td>{plant.isPrimary ? <Badge variant="info">Principal</Badge> : '—'}</td>
                    <td>
                      <Badge variant={plant.active ? 'success' : 'default'}>
                        {plant.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Link
                        to={ROUTES.operationsPlantEdit.replace(':id', plant.id)}
                        className="neo-table-link"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => handleDeletePlant(plant.id, plant.name)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'sites' ? (
        <Card padding="none" className="overflow-hidden">
          <div className="neo-table-wrap border-0 shadow-none">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Corredor</th>
                  <th>Coordenadas</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {workSites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <strong className="block text-slate-900">{site.name}</strong>
                    </td>
                    <td>{zoneLabel(site.zoneId)}</td>
                    <td className="text-xs tabular-nums text-slate-500">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </td>
                    <td>
                      <Badge variant={site.active ? 'success' : 'default'}>
                        {site.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Link
                        to={ROUTES.operationsSiteEdit.replace(':id', site.id)}
                        className="neo-table-link"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => handleDeleteSite(site.id, site.name)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'routes' ? (
        <Card padding="none" className="overflow-hidden">
          <div className="neo-table-wrap border-0 shadow-none">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th>Planta → Sitio</th>
                  <th>Tiempo est.</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => {
                  const plant = plants.find((item) => item.id === route.plantId)
                  const site = workSites.find((item) => item.id === route.workSiteId)
                  return (
                    <tr key={route.id}>
                      <td>
                        <span className="mr-2 inline-block size-3 rounded-full" style={{ background: route.color }} />
                        <strong className="text-slate-900">{route.name}</strong>
                      </td>
                      <td className="text-sm text-slate-600">
                        {plant?.name ?? '—'} → {site?.name ?? '—'}
                      </td>
                      <td>{route.estimatedMinutes ? `${route.estimatedMinutes} min` : '—'}</td>
                      <td>
                        <Badge variant={route.active ? 'success' : 'default'}>
                          {route.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="space-x-2 whitespace-nowrap">
                        <Link
                          to={ROUTES.operationsRouteEdit.replace(':id', route.id)}
                          className="neo-table-link"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="text-xs font-medium text-red-600 hover:underline"
                          onClick={() => handleDeleteRoute(route.id, route.name)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </section>
  )
}
