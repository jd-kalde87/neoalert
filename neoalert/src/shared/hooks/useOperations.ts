import { useEffect, useMemo } from 'react'
import { ZONE_OPTIONS } from '@shared/constants/filter-options'
import { useOperationsStore } from '@shared/stores/operationsStore'

export function useOperationsBootstrap() {
  const fetchOperations = useOperationsStore((state) => state.fetchOperations)
  const isLoading = useOperationsStore((state) => state.isLoading)
  const isError = useOperationsStore((state) => state.isError)
  const error = useOperationsStore((state) => state.error)
  const hasLoaded = useOperationsStore((state) => state.hasLoaded)

  useEffect(() => {
    void fetchOperations().catch(() => undefined)
  }, [fetchOperations])

  return {
    isLoading,
    isError,
    error,
    hasLoaded,
    refetch: () => fetchOperations({ force: true }),
  }
}

export function usePlants() {
  return useOperationsStore((state) => state.plants)
}

export function useWorkSites() {
  return useOperationsStore((state) => state.workSites)
}

export function useOperationalRoutes() {
  return useOperationsStore((state) => state.routes)
}

export function usePrimaryPlant() {
  const plants = useOperationsStore((state) => state.plants)
  return useMemo(
    () =>
      plants.find((item) => item.isPrimary && item.active) ??
      plants.find((item) => item.active),
    [plants],
  )
}

export function useActiveOperationalData() {
  const plants = useOperationsStore((state) => state.plants)
  const workSites = useOperationsStore((state) => state.workSites)
  const routes = useOperationsStore((state) => state.routes)

  return useMemo(
    () => ({
      plants: plants.filter((item) => item.active),
      workSites: workSites.filter((item) => item.active),
      routes: routes.filter((item) => item.active),
    }),
    [plants, workSites, routes],
  )
}

export function useRouteNameOptions() {
  const routes = useOperationsStore((state) => state.routes)
  return useMemo(
    () =>
      routes
        .filter((route) => route.active)
        .map((route) => ({ value: route.name, label: route.name })),
    [routes],
  )
}

export function useWorkSiteLabelOptions() {
  const workSites = useOperationsStore((state) => state.workSites)
  return useMemo(
    () =>
      workSites
        .filter((site) => site.active)
        .map((site) => ({ value: site.name, label: site.name, id: site.id })),
    [workSites],
  )
}

export function useWorkSiteByName(name: string | undefined) {
  const workSites = useOperationsStore((state) => state.workSites)
  return useMemo(
    () => workSites.find((site) => site.name === name),
    [workSites, name],
  )
}

export function zoneLabel(zoneId: string) {
  return ZONE_OPTIONS.find((zone) => zone.value === zoneId)?.label ?? zoneId
}

export function usePlantOptions() {
  const plants = useOperationsStore((state) => state.plants)
  return useMemo(
    () =>
      plants
        .filter((plant) => plant.active)
        .map((plant) => ({ value: plant.id, label: plant.name })),
    [plants],
  )
}

export function useWorkSiteSelectOptions() {
  const workSites = useOperationsStore((state) => state.workSites)
  return useMemo(
    () =>
      workSites
        .filter((site) => site.active)
        .map((site) => ({ value: site.id, label: site.name })),
    [workSites],
  )
}
