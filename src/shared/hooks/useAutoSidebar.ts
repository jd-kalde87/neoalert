import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTES } from '@shared/constants/routes'
import { useUiStore } from '@shared/stores/uiStore'

const AUTO_COLLAPSE_MEDIA = '(max-width: 1279px)'

export function useAutoSidebar() {
  const location = useLocation()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const [hoverExpanded, setHoverExpanded] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(AUTO_COLLAPSE_MEDIA)
    const collapseOnNarrow = () => {
      if (media.matches) {
        setSidebarCollapsed(true)
      }
    }
    collapseOnNarrow()
    media.addEventListener('change', collapseOnNarrow)
    return () => media.removeEventListener('change', collapseOnNarrow)
  }, [setSidebarCollapsed])

  useEffect(() => {
    if (location.pathname.startsWith(ROUTES.maps)) {
      setSidebarCollapsed(true)
    }
  }, [location.pathname, setSidebarCollapsed])

  const showExpanded = !sidebarCollapsed || hoverExpanded

  return {
    sidebarCollapsed,
    showExpanded,
    setHoverExpanded,
    toggleSidebar,
  }
}
