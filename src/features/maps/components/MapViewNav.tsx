import { NavLink } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { cn } from '@shared/utils/cn'

export function MapViewNav() {
  return (
    <nav className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Vistas de mapa">
      <NavLink
        to={ROUTES.maps}
        className={({ isActive }) =>
          cn(
            'flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold no-underline transition-colors',
            isActive ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
          )
        }
      >
        Mapa de riesgos
      </NavLink>
      <NavLink
        to={ROUTES.heatmap}
        className={({ isActive }) =>
          cn(
            'flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold no-underline transition-colors',
            isActive ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
          )
        }
      >
        Mapa de calor
      </NavLink>
    </nav>
  )
}
