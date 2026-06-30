import { NavLink } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { cn } from '@shared/utils/cn'

export function MapViewNav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Vistas de mapa">
      <NavLink
        to={ROUTES.maps}
        className={({ isActive }) =>
          cn(
            'inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-semibold no-underline transition-colors',
            isActive
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50',
          )
        }
      >
        Operativo
      </NavLink>
      <NavLink
        to={ROUTES.heatmap}
        className={({ isActive }) =>
          cn(
            'inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-semibold no-underline transition-colors',
            isActive
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50',
          )
        }
      >
        Heatmap
      </NavLink>
    </nav>
  )
}
