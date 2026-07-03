import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Building2,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  ScrollText,
  Shield,
  Upload,
  UserCheck,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { APP_NAME } from '@shared/constants/app'
import { ROUTES } from '@shared/constants/routes'
import { GlobalFilterBar } from '@shared/components/filters/GlobalFilterBar'
import { NotificationBell } from '@features/notifications'
import { Button } from '@shared/components/ui/Button'
import { useAutoSidebar } from '@shared/hooks/useAutoSidebar'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { cn } from '@shared/utils/cn'

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.maps, label: 'Mapa de riesgos', icon: Map },
  { to: ROUTES.operations, label: 'Proyectos y rutas', icon: Building2 },
  { to: ROUTES.incidents, label: 'Incidentes', icon: Shield },
  { to: ROUTES.attendance, label: 'Asistencia', icon: UserCheck },
  { to: ROUTES.notifications, label: 'Notificaciones', icon: Bell },
  { to: ROUTES.imports, label: 'Importaciones', icon: Upload },
  { to: ROUTES.importTemplates, label: 'Plantillas', icon: FileSpreadsheet },
  { to: ROUTES.reports, label: 'Reportes', icon: BarChart3 },
  { to: ROUTES.audit, label: 'Auditoría', icon: ScrollText },
]

export function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const isOnline = useUiStore((state) => state.isOnline)
  const { sidebarCollapsed, showExpanded, setHoverExpanded, toggleSidebar } = useAutoSidebar()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={cn(
          'hidden shrink-0 flex-col overflow-hidden bg-brand-900 text-white transition-[width] duration-200 ease-out lg:flex',
          showExpanded
            ? 'w-[var(--sidebar-width)] gap-2 p-2.5'
            : 'w-[var(--sidebar-collapsed-width)] gap-1.5 p-2',
        )}
        aria-label="Navegación principal"
        onMouseEnter={() => {
          if (sidebarCollapsed) setHoverExpanded(true)
        }}
        onMouseLeave={() => setHoverExpanded(false)}
      >
        <div
          className={cn(
            'flex items-center',
            showExpanded ? 'min-h-8 gap-2' : 'min-h-7 justify-center',
          )}
        >
          <span
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-[0.6875rem] font-bold"
            aria-hidden
          >
            NA
          </span>
          {showExpanded ? (
            <strong className="truncate text-xs font-semibold leading-tight">{APP_NAME}</strong>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-px">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={!showExpanded ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-md text-xs font-medium leading-snug no-underline transition-colors',
                    showExpanded ? 'gap-2 px-2 py-2' : 'justify-center p-2',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {showExpanded ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 shadow-sm lg:px-4"
          style={{ minHeight: 'var(--topbar-height)' }}
        >
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="lg:inline-flex">
            <Menu className="size-3.5" />
            <span className="hidden text-sm sm:inline">Menú</span>
          </Button>

          <div className="flex items-center gap-2 text-sm">
            {!isOnline ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                <WifiOff className="size-3" />
                Sin conexión
              </span>
            ) : null}
            <NotificationBell />
            <span className="hidden font-medium text-slate-700 sm:inline">
              {user?.name ?? 'Usuario'}
            </span>
            <Button variant="secondary" size="sm" onClick={clearSession}>
              <LogOut className="size-3" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </header>

        <GlobalFilterBar />

        <main className="flex-1 p-3 lg:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
