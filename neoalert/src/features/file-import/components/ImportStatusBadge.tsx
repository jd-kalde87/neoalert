import { Badge } from '@shared/components/ui/Badge'
import type { ImportJobStatus } from '../types/import.types'
import { IMPORT_STATUS_LABELS } from '../types/import.types'

const STATUS_VARIANT: Record<
  ImportJobStatus,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  uploaded: 'info',
  mapping: 'info',
  validating: 'info',
  processing: 'warning',
  completed: 'success',
  partial: 'warning',
  failed: 'danger',
}

interface ImportStatusBadgeProps {
  status: ImportJobStatus
}

export function ImportStatusBadge({ status }: ImportStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{IMPORT_STATUS_LABELS[status]}</Badge>
}
