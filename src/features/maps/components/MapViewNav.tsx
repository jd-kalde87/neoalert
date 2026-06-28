import { NavLink } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { cn } from '@shared/utils/cn'

export function MapViewNav() {
  return (
    <nav className="mb-4 flex gap-2" aria-label="Vistas de mapa">
      <NavLink
        to={ROUTES.maps}
        className={({ isActive }) =>
          cn(
            'inline-flex min-h-[34px] items-center rounded-md border px-3 text-[0.8125rem] font-semibold no-underline',
            isActive
              ? 'border-accent bg-brand-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-900',
          )
        }
      >
        Operativo
      </NavLink>
      <NavLink
        to={ROUTES.heatmap}
        className={({ isActive }) =>
          cn(
            'inline-flex min-h-[34px] items-center rounded-md border px-3 text-[0.8125rem] font-semibold no-underline',
            isActive
              ? 'border-accent bg-brand-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-900',
          )
        }
      >
        Heatmap
      </NavLink>
    </nav>
  )
}
