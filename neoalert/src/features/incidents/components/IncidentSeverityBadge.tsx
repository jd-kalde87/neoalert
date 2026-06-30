import { Badge } from '@shared/components/ui/Badge'
import type { IncidentSeverity } from '../types/incident.types'
import { INCIDENT_SEVERITY_LABELS } from '../types/incident.types'

const VARIANT: Record<IncidentSeverity, 'info' | 'warning' | 'danger' | 'default'> = {
  low: 'info',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
}

export function IncidentSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return <Badge variant={VARIANT[severity]}>{INCIDENT_SEVERITY_LABELS[severity]}</Badge>
}
