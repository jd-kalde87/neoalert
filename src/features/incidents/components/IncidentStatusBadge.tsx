import { Badge } from '@shared/components/ui/Badge'
import type { IncidentStatus } from '../types/incident.types'
import { INCIDENT_STATUS_LABELS } from '../types/incident.types'

const VARIANT: Record<
  IncidentStatus,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  open: 'danger',
  in_review: 'warning',
  in_progress: 'info',
  resolved: 'success',
  closed: 'default',
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge variant={VARIANT[status]}>{INCIDENT_STATUS_LABELS[status]}</Badge>
}
