import { useEffect } from 'react'
import { useUiStore } from '@shared/stores/uiStore'

export function useOnlineStatus() {
  const setOnline = useUiStore((state) => state.setOnline)
  const isOnline = useUiStore((state) => state.isOnline)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return isOnline
}
