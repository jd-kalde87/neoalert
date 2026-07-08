import type { AlertSeverity } from '@shared/types/alert.types'
import { Badge } from '@shared/components/ui/Badge'

const VARIANT: Record<AlertSeverity, 'default' | 'warning' | 'danger' | 'info'> = {
  low: 'info',
  medium: 'default',
  high: 'warning',
  critical: 'danger',
}

const LABEL: Record<AlertSeverity, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
}

export function NewsSeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <Badge variant={VARIANT[severity]}>{LABEL[severity]}</Badge>
}
