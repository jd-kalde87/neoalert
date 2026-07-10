import { create } from 'zustand'
import type { MapLayerMode } from '@shared/types/map.types'

interface MapUiState {
  layerMode: MapLayerMode
  selectedRiskId: string | null
  showRiskLayer: boolean
  showProjectsLayer: boolean
  setLayerMode: (mode: MapLayerMode) => void
  selectRisk: (id: string | null) => void
  setShowRiskLayer: (show: boolean) => void
  toggleRiskLayer: () => void
  setShowProjectsLayer: (show: boolean) => void
  toggleProjectsLayer: () => void
}

export const useMapStore = create<MapUiState>((set) => ({
  layerMode: 'standard',
  selectedRiskId: null,
  showRiskLayer: false,
  showProjectsLayer: false,
  setLayerMode: (layerMode) => set({ layerMode }),
  selectRisk: (selectedRiskId) => set({ selectedRiskId }),
  setShowRiskLayer: (showRiskLayer) => set({ showRiskLayer }),
  toggleRiskLayer: () => set((state) => ({ showRiskLayer: !state.showRiskLayer })),
  setShowProjectsLayer: (showProjectsLayer) => set({ showProjectsLayer }),
  toggleProjectsLayer: () => set((state) => ({ showProjectsLayer: !state.showProjectsLayer })),
}))
