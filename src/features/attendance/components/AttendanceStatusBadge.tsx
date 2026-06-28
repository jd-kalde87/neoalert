import { Badge } from '@shared/components/ui/Badge'
import type { AttendanceSyncStatus } from '../types/attendance.types'
import { ATTENDANCE_STATUS_LABELS } from '../types/attendance.types'

const VARIANT: Record<
  AttendanceSyncStatus,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  pending: 'info',
  syncing: 'info',
  synced: 'success',
  offline_pending: 'warning',
  rejected: 'danger',
  requires_approval: 'warning',
}

export function AttendanceStatusBadge({ status }: { status: AttendanceSyncStatus }) {
  return <Badge variant={VARIANT[status]}>{ATTENDANCE_STATUS_LABELS[status]}</Badge>
}
