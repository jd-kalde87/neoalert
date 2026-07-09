import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useFilterStore } from '@shared/stores/filterStore'
import {
  COLOMBIA_ARMED_GROUPS_OVERLAY_BOUNDS,
  COLOMBIA_ARMED_GROUPS_OVERLAY_OPACITY,
  COLOMBIA_ARMED_GROUPS_OVERLAY_URL,
} from '@shared/constants/colombia-map.constants'

interface ColombiaArmedGroupsLayerProps {
  visible: boolean
}

export function ColombiaArmedGroupsLayer({ visible }: ColombiaArmedGroupsLayerProps) {
  const map = useMap()
  const projectId = useFilterStore((state) => state.filters.projectId)
  const departmentId = useFilterStore((state) => state.filters.departmentId)
  const municipalityId = useFilterStore((state) => state.filters.municipalityId)

  useEffect(() => {
    if (!visible) return

    const hasTerritorialZoom = Boolean(projectId || departmentId || municipalityId)
    if (!hasTerritorialZoom) {
      map.fitBounds(COLOMBIA_ARMED_GROUPS_OVERLAY_BOUNDS, { padding: [32, 32], maxZoom: 7 })
    }
  }, [visible, map, projectId, departmentId, municipalityId])

  useEffect(() => {
    if (!visible) return

    const overlay = L.imageOverlay(COLOMBIA_ARMED_GROUPS_OVERLAY_URL, COLOMBIA_ARMED_GROUPS_OVERLAY_BOUNDS, {
      opacity: COLOMBIA_ARMED_GROUPS_OVERLAY_OPACITY,
      interactive: false,
      className: 'neo-gao-image-overlay',
      alt: 'Presencia de grupos armados organizados en Colombia',
    })

    overlay.addTo(map)

    const element = overlay.getElement()
    if (element) {
      element.style.pointerEvents = 'none'
      element.style.mixBlendMode = 'multiply'
    }

    return () => {
      map.removeLayer(overlay)
    }
  }, [visible, map])

  return null
}
