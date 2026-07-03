import { create } from 'zustand'
import type { ColombiaThematicOverlay, MapLayerMode } from '@shared/types/map.types'

interface MapUiState {
  layerMode: MapLayerMode
  selectedRiskId: string | null
  colombiaOverlay: ColombiaThematicOverlay
  setLayerMode: (mode: MapLayerMode) => void
  selectRisk: (id: string | null) => void
  setColombiaOverlay: (overlay: ColombiaThematicOverlay) => void
}

export const useMapStore = create<MapUiState>((set) => ({
  layerMode: 'standard',
  selectedRiskId: null,
  colombiaOverlay: 'none',
  setLayerMode: (layerMode) => set({ layerMode }),
  selectRisk: (selectedRiskId) => set({ selectedRiskId }),
  setColombiaOverlay: (colombiaOverlay) => set({ colombiaOverlay }),
}))
