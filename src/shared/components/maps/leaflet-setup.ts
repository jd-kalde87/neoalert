import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url'
import markerIcon from 'leaflet/dist/images/marker-icon.png?url'
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url'

let configured = false

export function configureLeafletDefaults() {
  if (configured || typeof window === 'undefined') {
    return
  }

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })

  configured = true
}

export function createSeverityIcon(color: string) {
  return L.divIcon({
    className: 'neo-map-marker',
    html: `<span style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

/** Marcador para incidente nuevo / selección en mapa (evita icono default roto en Vite) */
export function createIncidentPickerIcon() {
  return L.divIcon({
    className: 'neo-map-marker',
    html: `<span style="background:#dc2626;width:18px;height:18px;border:2px solid #fff;box-shadow:0 1px 4px rgba(15,23,42,.35)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

/** Marcador de zona de riesgo (borde ámbar) */
export function createRiskZoneIcon(color: string) {
  return L.divIcon({
    className: 'neo-map-marker neo-map-marker--risk',
    html: `<span style="background:${color};width:20px;height:20px;border:3px solid #f59e0b;box-shadow:0 2px 6px rgba(15,23,42,.35)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

/** Marcador de proyecto WSP en mapa */
export function createProjectMarkerIcon(color: string) {
  return L.divIcon({
    className: 'neo-project-marker',
    html: `<span style="background:${color};width:24px;height:24px;border:2px solid #fff;border-radius:6px;box-shadow:0 2px 6px rgba(15,23,42,.4);display:grid;place-items:center;font-size:11px;font-weight:800;color:#fff">P</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export const SEVERITY_COLORS = {
  low: '#2563eb',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#dc2626',
} as const
