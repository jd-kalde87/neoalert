import { Card } from '@shared/components/ui/Card'

interface DashboardMapPreviewProps {
  activeIncidents: number
  zonesMonitored: number
  crewsOnField: number
}

export function DashboardMapPreview({
  activeIncidents,
  zonesMonitored,
  crewsOnField,
}: DashboardMapPreviewProps) {
  return (
    <Card className="flex min-h-full flex-col gap-4" padding="md">
      <header>
        <h2 className="text-base font-bold">Mapa de rutas y riesgos</h2>
        <p className="mt-0.5 text-[0.8125rem] text-slate-500">
          Vista resumida — rutas desde planta central e incidentes de seguridad
        </p>
      </header>

      <div
        className="relative min-h-[280px] overflow-hidden rounded-md border border-slate-200 bg-[linear-gradient(180deg,rgba(30,58,95,0.06),rgba(30,58,95,0.02)),repeating-linear-gradient(0deg,#e8eef5_0,#e8eef5_1px,transparent_1px,transparent_24px),repeating-linear-gradient(90deg,#e8eef5_0,#e8eef5_1px,transparent_1px,transparent_24px),#f8fafc]"
        aria-hidden="true"
      >
        <div className="absolute inset-[20%_25%] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.35),transparent_70%)] blur-sm" />
        <div className="absolute top-[28%] left-[32%] h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600 shadow-panel" />
        <div className="absolute top-[52%] left-[58%] h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 shadow-panel" />
        <div className="absolute top-[38%] left-[72%] h-3.5 w-3.5 rounded-full border-2 border-white bg-accent shadow-panel" />
      </div>

      <dl className="m-0 grid grid-cols-1 gap-3 min-[768px]:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <dt className="text-xs text-slate-500">Incidentes en ruta</dt>
          <dd className="mt-1 text-lg font-bold">{activeIncidents}</dd>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <dt className="text-xs text-slate-500">Corredores monitoreados</dt>
          <dd className="mt-1 text-lg font-bold">{zonesMonitored}</dd>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <dt className="text-xs text-slate-500">Personal en sitios</dt>
          <dd className="mt-1 text-lg font-bold">{crewsOnField}</dd>
        </div>
      </dl>
    </Card>
  )
}
