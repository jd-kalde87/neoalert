import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFilterStore } from '@shared/stores/filterStore'
import type { IncidentListFilters } from '../types/incident.types'
import {
  addIncidentComment,
  createIncident,
  fetchIncidentById,
  fetchIncidents,
  updateIncidentStatus,
} from '../services/incidents.api'
import { createSecurityNotification } from '@features/notifications/services/notifications.api'
import type { CreateIncidentDto } from '../types/incident.types'

export function useIncidents(localFilters: IncidentListFilters = {}) {
  const globalFilters = useFilterStore((state) => state.filters)

  return useQuery({
    queryKey: ['incidents', 'list', globalFilters, localFilters],
    queryFn: () => fetchIncidents(globalFilters, localFilters),
  })
}

export function useIncidentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['incidents', 'detail', id],
    queryFn: () => fetchIncidentById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateIncidentDto) => createIncident(payload),
    onSuccess: async (incident) => {
      await createSecurityNotification({
        title: incident.blocksTransit
          ? `Ruta bloqueada — ${incident.title}`
          : `Alerta de seguridad — ${incident.title}`,
        message: incident.description,
        type: incident.blocksTransit ? 'route_block' : 'security_incident',
        severity: incident.severity,
        incidentId: incident.id,
        routeName: incident.routeName,
        blocksTransit: incident.blocksTransit,
      })
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['maps'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useAddIncidentComment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (note: string) => addIncidentComment(id, note),
    onSuccess: (incident) => {
      queryClient.setQueryData(['incidents', 'detail', id], incident)
      void queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] })
    },
  })
}

export function useUpdateIncidentStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      status,
      note,
    }: {
      status: Parameters<typeof updateIncidentStatus>[1]
      note?: string
    }) => updateIncidentStatus(id, status, note),
    onSuccess: (incident) => {
      queryClient.setQueryData(['incidents', 'detail', id], incident)
      void queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] })
    },
  })
}
