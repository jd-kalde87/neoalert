import { create } from 'zustand'
import type { MapLayerMode } from '@shared/types/map.types'

interface MapUiState {
  layerMode: MapLayerMode
  selectedIncidentId: string | null
  setLayerMode: (mode: MapLayerMode) => void
  selectIncident: (id: string | null) => void
}

export const useMapStore = create<MapUiState>((set) => ({
  layerMode: 'standard',
  selectedIncidentId: null,
  setLayerMode: (layerMode) => set({ layerMode }),
  selectIncident: (selectedIncidentId) => set({ selectedIncidentId }),
}))
