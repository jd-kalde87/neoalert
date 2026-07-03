import { matchesTerritoryFilters } from '@shared/utils/territoryFilters'
import type { GlobalFilters } from '@shared/types/common.types'
import type {
  AuditListFilters,
  AuditLogEntry,
  AuditSummary,
} from '../types/audit.types'

const AUDIT_DB: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-06-28T08:15:00Z',
    actor: 'María López',
    actorEmail: 'maria.lopez@neoalert.local',
    actorRole: 'Supervisor de área',
    action: 'create',
    entity: 'incident',
    entityId: 'SEG-004',
    entityLabel: 'SEG-004 — Bloqueo en corredor Norte',
    summary: 'Registró incidente de seguridad con bloqueo de tránsito en Ruta Alpha.',
    outcome: 'success',
    ipAddress: '192.168.10.44',
    userAgent: 'Chrome 125 / Windows',
    zoneId: 'zone-norte',
    siteId: 'site-alpha',
    changes: [
      { field: 'severity', label: 'Nivel de riesgo', next: 'critical' },
      { field: 'blocksTransit', label: 'Bloquea tránsito', next: 'true' },
      { field: 'status', label: 'Estado', next: 'open' },
    ],
    metadata: {
      routeName: 'Ruta Alpha',
      coordinates: '-12.046, -77.042',
    },
  },
  {
    id: 'aud-002',
    timestamp: '2026-06-28T07:52:00Z',
    actor: 'Carlos Ruiz',
    actorEmail: 'carlos.ruiz@neoalert.local',
    actorRole: 'Colaborador',
    action: 'reject',
    entity: 'attendance',
    entityId: 'att-1182',
    entityLabel: 'Marcación entrada — Ruta Alpha',
    summary: 'Marcación rechazada automáticamente por incidente activo SEG-001.',
    outcome: 'warning',
    ipAddress: '10.0.0.88',
    userAgent: 'NeoAlert Mobile / Android',
    zoneId: 'zone-norte',
    changes: [
      { field: 'status', label: 'Estado', previous: 'pending', next: 'rejected' },
      {
        field: 'rejectedReason',
        label: 'Motivo',
        next: 'Ruta bloqueada por incidente SEG-001',
      },
    ],
    metadata: { incidentCode: 'SEG-001' },
  },
  {
    id: 'aud-003',
    timestamp: '2026-06-27T16:32:00Z',
    actor: 'Admin NeoAlert',
    actorEmail: 'admin@neoalert.local',
    actorRole: 'Administrador',
    action: 'import',
    entity: 'import',
    entityId: 'imp-001',
    entityLabel: 'incidentes_junio.csv',
    summary: 'Importación masiva de incidentes finalizada con errores parciales (12 filas).',
    outcome: 'warning',
    ipAddress: '192.168.1.10',
    userAgent: 'Chrome 125 / Windows',
    metadata: { validRows: '108', errorRows: '12', template: 'Incidentes de seguridad' },
  },
  {
    id: 'aud-004',
    timestamp: '2026-06-27T14:10:00Z',
    actor: 'Admin NeoAlert',
    actorEmail: 'admin@neoalert.local',
    actorRole: 'Administrador',
    action: 'update',
    entity: 'import_template',
    entityId: 'tpl-incidents',
    entityLabel: 'Incidentes de seguridad v2.1',
    summary: 'Actualizó plantilla de importación — nueva versión 2.1.',
    outcome: 'success',
    ipAddress: '192.168.1.10',
    changes: [
      { field: 'version', label: 'Versión', previous: '2.0', next: '2.1' },
      { field: 'fields', label: 'Campos', previous: '6', next: '7' },
    ],
  },
  {
    id: 'aud-005',
    timestamp: '2026-06-27T11:05:00Z',
    actor: 'Sistema',
    actorEmail: 'system@neoalert.local',
    actorRole: 'Sistema',
    action: 'notify',
    entity: 'notification',
    entityId: 'ntf-089',
    entityLabel: 'Ruta bloqueada — Altercado en vía',
    summary: 'Notificación de seguridad enviada a cuadrilla Norte-A.',
    outcome: 'success',
    metadata: { recipients: '12', channel: 'push+email' },
  },
  {
    id: 'aud-006',
    timestamp: '2026-06-27T09:30:00Z',
    actor: 'Ana Torres',
    actorEmail: 'ana.torres@neoalert.local',
    actorRole: 'Analista',
    action: 'export',
    entity: 'report',
    entityId: 'security-incidents',
    entityLabel: 'Reporte incidentes de seguridad',
    summary: 'Exportó reporte en formato PDF para el período seleccionado.',
    outcome: 'success',
    ipAddress: '192.168.20.5',
    metadata: { format: 'pdf', filters: 'Jun 2026, Corredor Norte' },
  },
  {
    id: 'aud-007',
    timestamp: '2026-06-26T18:45:00Z',
    actor: 'María López',
    actorEmail: 'maria.lopez@neoalert.local',
    actorRole: 'Supervisor de área',
    action: 'status_change',
    entity: 'incident',
    entityId: 'SEG-001',
    entityLabel: 'SEG-001 — Bloqueo total Ruta Alpha',
    summary: 'Cambió estado del incidente de abierto a en revisión.',
    outcome: 'success',
    changes: [
      { field: 'status', label: 'Estado', previous: 'open', next: 'in_review' },
    ],
  },
  {
    id: 'aud-008',
    timestamp: '2026-06-26T17:20:00Z',
    actor: 'Carlos Ruiz',
    actorEmail: 'carlos.ruiz@neoalert.local',
    actorRole: 'Colaborador',
    action: 'approve',
    entity: 'attendance',
    entityId: 'att-1170',
    entityLabel: 'Marcación salida — Sitio Beta',
    summary: 'Supervisor aprobó marcación que requería validación manual.',
    outcome: 'success',
    changes: [
      { field: 'status', label: 'Estado', previous: 'requires_approval', next: 'synced' },
    ],
  },
  {
    id: 'aud-009',
    timestamp: '2026-06-26T08:02:00Z',
    actor: 'Usuario desconocido',
    actorEmail: 'unknown@external.local',
    actorRole: '—',
    action: 'login',
    entity: 'user',
    entityId: 'usr-failed',
    entityLabel: 'Intento de acceso',
    summary: 'Intento de inicio de sesión fallido — credenciales inválidas.',
    outcome: 'failure',
    ipAddress: '203.0.113.55',
    userAgent: 'Firefox 126 / Linux',
  },
  {
    id: 'aud-010',
    timestamp: '2026-06-25T15:00:00Z',
    actor: 'Admin NeoAlert',
    actorEmail: 'admin@neoalert.local',
    actorRole: 'Administrador',
    action: 'update',
    entity: 'route',
    entityId: 'route-alpha',
    entityLabel: 'Ruta Alpha — Planta → Sitio Alpha',
    summary: 'Actualizó configuración operativa del corredor Norte.',
    outcome: 'success',
    changes: [
      { field: 'estimatedMinutes', label: 'Tiempo estimado', previous: '45', next: '52' },
      { field: 'active', label: 'Activa', previous: 'true', next: 'true' },
    ],
  },
]

function inDateRange(timestamp: string, filters: GlobalFilters) {
  const date = new Date(timestamp).getTime()
  if (filters.dateFrom && date < new Date(filters.dateFrom).getTime()) return false
  if (filters.dateTo && date > new Date(`${filters.dateTo}T23:59:59`).getTime()) return false
  return true
}

function applyFilters(
  entries: AuditLogEntry[],
  globalFilters: GlobalFilters,
  localFilters: AuditListFilters,
) {
  const search = localFilters.search?.trim().toLowerCase()

  return entries.filter((entry) => {
    if (!inDateRange(entry.timestamp, globalFilters)) return false
    if (!matchesTerritoryFilters(entry, globalFilters)) return false
    if (localFilters.entity && entry.entity !== localFilters.entity) return false
    if (localFilters.action && entry.action !== localFilters.action) return false
    if (localFilters.outcome && entry.outcome !== localFilters.outcome) return false
    if (localFilters.actor && !entry.actor.toLowerCase().includes(localFilters.actor.toLowerCase())) {
      return false
    }
    if (search) {
      const haystack = [
        entry.summary,
        entry.entityLabel,
        entry.actor,
        entry.actorEmail,
        entry.entityId,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

export async function fetchAuditLogs(
  globalFilters: GlobalFilters,
  localFilters: AuditListFilters = {},
) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return applyFilters(AUDIT_DB, globalFilters, localFilters).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

export async function fetchAuditSummary(
  globalFilters: GlobalFilters,
  localFilters: AuditListFilters = {},
): Promise<AuditSummary> {
  const entries = applyFilters(AUDIT_DB, globalFilters, localFilters)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  return {
    totalEvents: entries.length,
    todayEvents: entries.filter((entry) => new Date(entry.timestamp) >= todayStart).length,
    criticalActions: entries.filter(
      (entry) =>
        entry.outcome === 'failure' ||
        (entry.entity === 'incident' && entry.action === 'create') ||
        entry.action === 'reject',
    ).length,
    failedEvents: entries.filter((entry) => entry.outcome === 'failure').length,
  }
}

export async function fetchAuditById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const entry = AUDIT_DB.find((item) => item.id === id)
  if (!entry) throw new Error('Evento de auditoría no encontrado')
  return entry
}

export async function exportAuditLogs(
  globalFilters: GlobalFilters,
  localFilters: AuditListFilters = {},
) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const entries = applyFilters(AUDIT_DB, globalFilters, localFilters)
  return {
    filename: `auditoria_${new Date().toISOString().slice(0, 10)}.csv`,
    rowCount: entries.length,
  }
}
