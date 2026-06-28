import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import type { AttendanceListFilters, AttendanceMarkType, AttendanceSyncStatus } from '../types/attendance.types'
import { ATTENDANCE_STATUS_LABELS, MARK_TYPE_LABELS } from '../types/attendance.types'

const statusOptions = Object.entries(ATTENDANCE_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const markOptions = Object.entries(MARK_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface AttendanceFiltersProps {
  filters: AttendanceListFilters
  onChange: (filters: AttendanceListFilters) => void
}

export function AttendanceFilters({ filters, onChange }: AttendanceFiltersProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 min-[900px]:grid-cols-[2fr_1fr_1fr]">
      <Input
        label="Buscar"
        name="search"
        placeholder="Colaborador, ruta o ubicación"
        value={filters.search ?? ''}
        onChange={(event) =>
          onChange({ ...filters, search: event.target.value || undefined })
        }
      />
      <Select
        label="Estado sync"
        name="status"
        value={filters.status ?? ''}
        options={statusOptions}
        onChange={(value) =>
          onChange({ ...filters, status: (value as AttendanceSyncStatus) || undefined })
        }
      />
      <Select
        label="Tipo marcación"
        name="markType"
        value={filters.markType ?? ''}
        options={markOptions}
        onChange={(value) =>
          onChange({ ...filters, markType: (value as AttendanceMarkType) || undefined })
        }
      />
    </div>
  )
}
