import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  ShieldCheck,
  Upload,
  UserCheck,
  Users,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { APP_NAME } from '@shared/constants/app'
import { ROUTES } from '@shared/constants/routes'
import { GlobalFilterBar } from '@shared/components/filters/GlobalFilterBar'
import { NotificationBell } from '@features/notifications'
import { Button } from '@shared/components/ui/Button'
import { useOperationsBootstrap } from '@shared/hooks/useOperations'
import { useAuthAccess } from '@shared/hooks/usePermissions'
import { useAuthStore } from '@shared/stores/authStore'
import { useUiStore } from '@shared/stores/uiStore'
import { cn } from '@shared/utils/cn'

const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.maps, label: 'Mapa de rutas', icon: Map },
  { to: ROUTES.operations, label: 'Plantas y rutas', icon: Building2 },
  { to: ROUTES.incidents, label: 'Seguridad', icon: Shield },
  { to: ROUTES.attendance, label: 'Asistencia', icon: UserCheck },
  { to: ROUTES.notifications, label: 'Notificaciones', icon: Bell },
  { to: ROUTES.imports, label: 'Importaciones', icon: Upload },
  { to: ROUTES.importTemplates, label: 'Plantillas', icon: FileSpreadsheet },
  { to: ROUTES.reports, label: 'Reportes', icon: BarChart3 },
  { to: ROUTES.audit, label: 'Auditoría', icon: ScrollText },
  { to: ROUTES.users, label: 'Usuarios', icon: Users },
  { to: ROUTES.roles, label: 'Roles y permisos', icon: ShieldCheck },
]

export function AppLayout() {
  useOperationsBootstrap()

  const { canAccessNavItem } = useAuthAccess()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const isOnline = useUiStore((state) => state.isOnline)

  const visibleNavItems = NAV_ITEMS.filter((item) => canAccessNavItem(item.to))
  const location = useLocation()
  const isMapRoute = location.pathname.startsWith(ROUTES.maps)

  return (
    <div
      className={cn(
        'grid min-h-screen bg-brand-50',
        sidebarCollapsed ? 'lg:grid-cols-[4.5rem_1fr]' : 'lg:grid-cols-[var(--sidebar-width)_1fr]',
      )}
    >
      <aside
        className="hidden flex-col gap-5 border-r border-white/10 bg-gradient-to-b from-brand-900 via-brand-900 to-brand-800 p-4 text-white lg:flex"
        aria-label="Navegación principal"
      >
        <div className="flex min-h-10 items-center gap-3 px-1">
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-blue-400 text-sm font-bold text-white shadow-lg shadow-accent/25"
            aria-hidden
          >
            NA
          </span>
          {!sidebarCollapsed ? (
            <strong className="truncate text-base font-semibold tracking-tight">{APP_NAME}</strong>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all duration-200',
                    isActive
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/75 hover:bg-white/10 hover:text-white',
                    sidebarCollapsed && 'justify-center px-2',
                  )
                }
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex h-screen min-h-0 min-w-0 flex-col overflow-hidden">
        <header className="neo-glass sticky top-0 z-40 flex min-h-[var(--topbar-height)] items-center justify-between gap-4 px-4 lg:px-6">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="lg:inline-flex">
            <Menu className="size-4" />
            <span className="hidden sm:inline">Menú</span>
          </Button>

          <div className="flex items-center gap-3 text-sm">
            {!isOnline ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                <WifiOff className="size-3" />
                Sin conexión
              </span>
            ) : null}
            <NotificationBell />
            <span className="hidden font-medium text-slate-700 sm:inline">
              {user?.name ?? 'Usuario'}
            </span>
            <Button variant="secondary" size="sm" onClick={clearSession}>
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </header>

        <GlobalFilterBar />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 lg:p-6">
          <div
            className={cn(
              'min-h-0 flex-1',
              isMapRoute ? 'overflow-hidden' : 'overflow-y-auto',
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
