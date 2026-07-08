import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NewsAlertsState {
  dismissedRegionalKeys: string[]
  dismissRegional: (key: string) => void
  clearDismissed: () => void
}

export const useNewsAlertsStore = create<NewsAlertsState>()(
  persist(
    (set) => ({
      dismissedRegionalKeys: [],
      dismissRegional: (key) =>
        set((state) => ({
          dismissedRegionalKeys: state.dismissedRegionalKeys.includes(key)
            ? state.dismissedRegionalKeys
            : [...state.dismissedRegionalKeys, key],
        })),
      clearDismissed: () => set({ dismissedRegionalKeys: [] }),
    }),
    {
      name: 'neoalert-news-alerts',
      partialize: (state) => ({ dismissedRegionalKeys: state.dismissedRegionalKeys }),
    },
  ),
)
