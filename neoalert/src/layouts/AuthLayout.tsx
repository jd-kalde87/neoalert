import { Outlet } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { APP_NAME, APP_DESCRIPTION } from '@shared/constants/app'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-brand-50 lg:grid-cols-2">
      <section
        className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-accent p-10 text-white lg:flex"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.18),transparent_50%)]" />
        <div className="relative">
          <div className="mb-8 inline-flex size-14 items-center justify-center rounded-2xl bg-white/15 shadow-elevated backdrop-blur">
            <Shield className="size-7" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">{APP_DESCRIPTION}</p>
        </div>
        <p className="relative text-sm text-white/60">
          Seguridad operativa en rutas planta → sitios de trabajo
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </section>
    </div>
  )
}
