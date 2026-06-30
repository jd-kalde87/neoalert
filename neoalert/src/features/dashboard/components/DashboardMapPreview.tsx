import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { DynamicTileLayer } from '@shared/components/maps/DynamicTileLayer'
import { configureLeafletDefaults } from '@shared/components/maps/leaflet-setup'
import { useMapIncidents } from '@features/maps/hooks/useMapIncidents'
import { ROUTES } from '@shared/constants/routes'
import 'leaflet/dist/leaflet.css'

const SEVERITY_COLORS: Record<string, string> = {
  low: '#60a5fa',
  medium: '#fbbf24',
  high: '#fb923c',
  critical: '#ef4444',
}

function severityIcon(severity: string) {
  const color = SEVERITY_COLORS[severity] ?? '#0071e3'
  return L.divIcon({
    className: 'neo-dashboard-marker',
    html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25)"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

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
  const { data, isLoading } = useMapIncidents()

  useEffect(() => {
    configureLeafletDefaults()
  }, [])

  const incidents = data?.incidents ?? []
  const center: [number, number] =
    incidents[0] != null
      ? [incidents[0].latitude, incidents[0].longitude]
      : [4.695, -74.13]

  return (
    <Card className="flex min-h-full flex-col gap-4 overflow-hidden" padding="md">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Mapa de rutas y riesgos
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Incidentes importados y en vivo sobre el corredor operativo
          </p>
        </div>
        <Link to={ROUTES.maps}>
          <Button size="sm" variant="secondary">
            Abrir mapa
          </Button>
        </Link>
      </header>

      <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-slate-200/70 shadow-inner">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center bg-slate-100 text-sm text-slate-500">
            Cargando mapa…
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-blue-50 px-6 text-center">
            <p className="text-sm font-medium text-slate-700">Sin incidentes en el mapa</p>
            <p className="text-xs text-slate-500">
              Importa un archivo de incidentes o regístralos manualmente para verlos aquí.
            </p>
            <Link to={ROUTES.importUpload}>
              <Button size="sm">Importar datos</Button>
            </Link>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={10}
            className="z-0 h-[300px] w-full"
            scrollWheelZoom={false}
          >
            <DynamicTileLayer layerMode="markers" />
            {incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={severityIcon(incident.severity)}
              >
                <Popup>
                  <strong>{incident.title}</strong>
                  <br />
                  {incident.zoneLabel}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-blue-50/60 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Incidentes en ruta
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {activeIncidents}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-emerald-50/60 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Corredores
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {zonesMonitored}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white to-violet-50/60 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Registros georreferenciados
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {crewsOnField}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
