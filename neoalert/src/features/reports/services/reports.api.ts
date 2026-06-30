import type { GlobalFilters } from '@shared/types/common.types'
import type { ReportData, ReportType } from '../types/report.types'
import { USE_MOCK_API } from '@shared/config/api.config'
import { API_ENDPOINTS } from '@shared/services/api/endpoints'
import { authorizedRequest } from '@shared/services/api'
import { toQueryParams } from '@shared/utils/query-params'

function filterMultiplier(filters: GlobalFilters) {
  let m = 1
  if (filters.zoneId) m *= 0.75
  if (filters.siteId) m *= 0.85
  if (filters.dateFrom || filters.dateTo) m *= 0.95
  return m
}

function scale(n: number, filters: GlobalFilters) {
  return Math.max(0, Math.round(n * filterMultiplier(filters)))
}

const builders: Record<ReportType, (filters: GlobalFilters) => ReportData> = {
  attendance: (filters) => ({
    type: 'attendance',
    title: 'Reporte de asistencia en ruta',
    description: 'Marcaciones validadas contra incidentes de seguridad activos.',
    generatedAt: new Date().toISOString(),
    kpis: [
      { id: '1', label: 'Total marcaciones', value: scale(48, filters) },
      { id: '2', label: 'Sincronizadas', value: scale(32, filters), variant: 'success' },
      {
        id: '3',
        label: 'Rechazadas por ruta bloqueada',
        value: scale(8, filters),
        variant: 'danger',
      },
      {
        id: '4',
        label: 'Requieren aprobación',
        value: scale(5, filters),
        variant: 'warning',
      },
      { id: '5', label: 'Pendientes offline', value: scale(3, filters) },
    ],
    series: [
      { label: 'Lun', value: scale(12, filters) },
      { label: 'Mar', value: scale(9, filters) },
      { label: 'Mié', value: scale(11, filters) },
      { label: 'Jue', value: scale(8, filters) },
      { label: 'Vie', value: scale(8, filters) },
    ],
    breakdown: [
      { id: 'b1', label: 'Entrada', value: scale(28, filters), percentage: 58 },
      { id: 'b2', label: 'Salida', value: scale(14, filters), percentage: 29 },
      { id: 'b3', label: 'Excepcional', value: scale(6, filters), percentage: 13 },
    ],
  }),

  'security-incidents': (filters) => ({
    type: 'security-incidents',
    title: 'Reporte de incidentes de seguridad',
    description: 'Registro de riesgos en vías hacia sitios de trabajo.',
    generatedAt: new Date().toISOString(),
    kpis: [
      { id: '1', label: 'Incidentes activos', value: scale(5, filters), variant: 'warning' },
      { id: '2', label: 'Rutas bloqueadas', value: scale(2, filters), variant: 'danger' },
      { id: '3', label: 'Riesgo crítico', value: scale(2, filters), variant: 'danger' },
      { id: '4', label: 'Mitigados (período)', value: scale(3, filters), variant: 'success' },
      { id: '5', label: 'Con evidencia GPS', value: scale(5, filters) },
    ],
    series: [
      { label: 'Bloqueo vial', value: scale(2, filters) },
      { label: 'Grupo armado', value: scale(2, filters) },
      { label: 'Altercados', value: scale(1, filters) },
      { label: 'Restricción', value: scale(1, filters) },
    ],
    breakdown: [
      { id: 'b1', label: 'Corredor Norte', value: scale(2, filters), percentage: 40 },
      { id: 'b2', label: 'Corredor Central', value: scale(1, filters), percentage: 20 },
      { id: 'b3', label: 'Corredor Sur', value: scale(1, filters), percentage: 20 },
      { id: 'b4', label: 'Corredor Oriental', value: scale(1, filters), percentage: 20 },
    ],
  }),

  'route-safety': (filters) => ({
    type: 'route-safety',
    title: 'Reporte de seguridad de rutas',
    description: 'Estado operativo planta central → sitios de trabajo.',
    generatedAt: new Date().toISOString(),
    kpis: [
      { id: '1', label: 'Rutas operativas', value: 4 },
      { id: '2', label: 'Rutas con restricción', value: scale(2, filters), variant: 'warning' },
      { id: '3', label: 'Rutas bloqueadas', value: scale(1, filters), variant: 'danger' },
      { id: '4', label: 'Sitios accesibles', value: scale(2, filters), variant: 'success' },
      { id: '5', label: 'Personal en planta (est.)', value: scale(24, filters) },
    ],
    series: [
      { label: 'Alpha', value: scale(3, filters) },
      { label: 'Beta', value: scale(2, filters) },
      { label: 'Gamma', value: scale(1, filters) },
      { label: 'Delta', value: scale(1, filters) },
    ],
    breakdown: [
      { id: 'b1', label: 'Planta → Alpha', value: scale(3, filters), percentage: 43 },
      { id: 'b2', label: 'Planta → Beta', value: scale(2, filters), percentage: 29 },
      { id: 'b3', label: 'Planta → Gamma', value: scale(1, filters), percentage: 14 },
      { id: 'b4', label: 'Planta → Delta', value: scale(1, filters), percentage: 14 },
    ],
  }),
}

export async function fetchReport(type: ReportType, filters: GlobalFilters) {
  if (!USE_MOCK_API) {
    return authorizedRequest<ReportData>(API_ENDPOINTS.reports.detail(type), {
      params: toQueryParams(filters),
    })
  }

  await new Promise((resolve) => setTimeout(resolve, 400))
  return builders[type](filters)
}

export async function exportReport(type: ReportType, format: 'csv' | 'excel' | 'pdf') {
  if (!USE_MOCK_API) {
    return authorizedRequest<{ filename: string; success: boolean }>(
      API_ENDPOINTS.reports.export(type),
      {
        method: 'POST',
        params: { format },
      },
    )
  }

  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    filename: `neoalert-${type}-${Date.now()}.${format === 'excel' ? 'xlsx' : format}`,
    success: true,
  }
}
