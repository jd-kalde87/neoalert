import { Badge } from '@shared/components/ui/Badge'
import type { AuditOutcome } from '../types/audit.types'
import { AUDIT_OUTCOME_LABELS } from '../types/audit.types'

const VARIANT: Record<AuditOutcome, 'success' | 'warning' | 'danger'> = {
  success: 'success',
  warning: 'warning',
  failure: 'danger',
}

interface AuditOutcomeBadgeProps {
  outcome: AuditOutcome
}

export function AuditOutcomeBadge({ outcome }: AuditOutcomeBadgeProps) {
  return <Badge variant={VARIANT[outcome]}>{AUDIT_OUTCOME_LABELS[outcome]}</Badge>
}
