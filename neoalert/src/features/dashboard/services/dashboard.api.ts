import type { GlobalFilters } from '@shared/types/common.types'
import type { DashboardSummary } from '../types/dashboard.types'
import { fetchIncidents } from '@features/incidents/services/incidents.api'
import { USE_MOCK_API } from '@shared/config/api.config'
import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import { toQueryParams } from '@shared/utils/query-params'
import { buildDashboardFromIncidents } from '../utils/buildDashboardFromIncidents'

export async function fetchDashboardSummary(filters: GlobalFilters): Promise<DashboardSummary> {
  const incidents = await fetchIncidents(filters)

  if (!USE_MOCK_API) {
    try {
      const remote = await authorizedRequest<DashboardSummary>(API_ENDPOINTS.dashboard.summary, {
        params: toQueryParams(filters),
      })
      if (incidents.length === 0) {
        return remote
      }
    } catch {
      // Use incident-derived dashboard when reporting-service is unavailable.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 200))
  return buildDashboardFromIncidents(incidents)
}
