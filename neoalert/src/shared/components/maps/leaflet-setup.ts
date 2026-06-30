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

export const SEVERITY_COLORS = {
  low: '#2563eb',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#dc2626',
} as const
