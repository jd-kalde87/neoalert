import { create } from 'zustand'
import { getDefaultDateRange, TENANT_OPTIONS } from '@shared/constants/filter-options'
import type { GlobalFilters } from '@shared/types/common.types'

interface FilterState {
  filters: GlobalFilters
  setFilters: (filters: Partial<GlobalFilters>) => void
  resetFilters: () => void
}

const defaultRange = getDefaultDateRange()

const initialFilters: GlobalFilters = {
  tenantId: TENANT_OPTIONS[0]?.value,
  ...defaultRange,
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: initialFilters,
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}))
