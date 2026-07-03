import { Link, useSearchParams } from 'react-router-dom'
import { Building2, MapPin, Route } from 'lucide-react'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { ROUTES } from '@shared/constants/routes'
import { municipalityLabel } from '@shared/hooks/useOperations'
import { useOperationsStore } from '@shared/stores/operationsStore'
import { cn } from '@shared/utils/cn'

type Tab = 'plants' | 'sites' | 'routes'

const TABS: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'plants', label: 'Proyectos', icon: Building2 },
  { id: 'sites', label: 'Departamentos', icon: MapPin },
  { id: 'routes', label: 'Rutas', icon: Route },
]

export function OperationsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'plants'

  const projects = useOperationsStore((state) => state.projects)
  const departments = useOperationsStore((state) => state.departments)
  const routes = useOperationsStore((state) => state.routes)
  const deleteProject = useOperationsStore((state) => state.deleteProject)
  const deleteDepartment = useOperationsStore((state) => state.deleteDepartment)
  const deleteRoute = useOperationsStore((state) => state.deleteRoute)

  const setTab = (next: Tab) => setParams({ tab: next })

  const handleDeleteProject = (id: string, name: string) => {
    if (!confirm(`¿Eliminar proyecto "${name}"?`)) return
    try {
      deleteProject(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  const handleDeleteDepartment = (id: string, name: string) => {
    if (!confirm(`¿Eliminar departamento "${name}"?`)) return
    try {
      deleteDepartment(id)
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
        title="Proyectos, departamentos y rutas"
        description="Catálogo territorial: proyectos, departamentos operativos y rutas entre ellos. Los cambios se reflejan en el mapa de riesgos."
        actions={
          tab === 'plants' ? (
            <Link to={ROUTES.operationsPlantNew}>
              <Button>Nuevo proyecto</Button>
            </Link>
          ) : tab === 'sites' ? (
            <Link to={ROUTES.operationsSiteNew}>
              <Button>Nuevo departamento</Button>
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
                  <th>País</th>
                  <th>Coordenadas</th>
                  <th>Principal</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong className="block text-slate-900">{project.name}</strong>
                      {project.description ? (
                        <span className="text-xs text-slate-500">{project.description}</span>
                      ) : null}
                    </td>
                    <td>{project.countryCode}</td>
                    <td className="text-xs tabular-nums text-slate-500">
                      {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                    </td>
                    <td>{project.isPrimary ? <Badge variant="info">Principal</Badge> : '—'}</td>
                    <td>
                      <Badge variant={project.active ? 'success' : 'default'}>
                        {project.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Link
                        to={ROUTES.operationsPlantEdit.replace(':id', project.id)}
                        className="neo-table-link"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => handleDeleteProject(project.id, project.name)}
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
                  <th>Municipio</th>
                  <th>Coordenadas</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td>
                      <strong className="block text-slate-900">{department.name}</strong>
                    </td>
                    <td>{municipalityLabel(department.municipalityId)}</td>
                    <td className="text-xs tabular-nums text-slate-500">
                      {department.latitude.toFixed(4)}, {department.longitude.toFixed(4)}
                    </td>
                    <td>
                      <Badge variant={department.active ? 'success' : 'default'}>
                        {department.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Link
                        to={ROUTES.operationsSiteEdit.replace(':id', department.id)}
                        className="neo-table-link"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => handleDeleteDepartment(department.id, department.name)}
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
                  <th>Proyecto → Departamento</th>
                  <th>Tiempo est.</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => {
                  const project = projects.find((item) => item.id === route.projectId)
                  const department = departments.find((item) => item.id === route.departmentId)
                  return (
                    <tr key={route.id}>
                      <td>
                        <span
                          className="mr-2 inline-block size-3 rounded-full"
                          style={{ background: route.color }}
                        />
                        <strong className="text-slate-900">{route.name}</strong>
                      </td>
                      <td className="text-sm text-slate-600">
                        {project?.name ?? '—'} → {department?.name ?? '—'}
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
