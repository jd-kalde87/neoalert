import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  isOnline: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setOnline: (online: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: true,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setOnline: (isOnline) => set({ isOnline }),
}))
