import { Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { APP_NAME, APP_DESCRIPTION } from '@shared/constants/app'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section
        className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-10 text-white lg:flex"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.25),transparent_55%)]" />
        <div className="relative">
          <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-white/10">
            <Shield className="size-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">{APP_DESCRIPTION}</p>
        </div>
        <p className="relative text-xs text-white/50">
          Seguridad operativa en rutas planta → sitios de trabajo
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </div>
  )
}
