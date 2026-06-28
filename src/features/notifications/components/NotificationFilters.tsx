import { Select } from '@shared/components/ui/Select'
import { Input } from '@shared/components/ui/Input'
import type { AlertSeverity } from '@shared/types/alert.types'
import type { NotificationFilters, NotificationType } from '../types/notification.types'
import { NOTIFICATION_TYPE_LABELS } from '../types/notification.types'

const readOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'read', label: 'Leídas' },
]

const severityOptions = [
  { value: 'critical', label: 'Crítico' },
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Medio' },
  { value: 'low', label: 'Bajo' },
]

const typeOptions = Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

interface NotificationFiltersBarProps {
  filters: NotificationFilters
  onChange: (filters: NotificationFilters) => void
}

export function NotificationFiltersBar({ filters, onChange }: NotificationFiltersBarProps) {
  return (
    <div className="neo-filter-grid mb-4 min-[900px]:grid-cols-[2fr_1fr_1fr_1fr]">
      <Input
        label="Buscar"
        name="search"
        placeholder="Título, ruta o mensaje"
        value={filters.search ?? ''}
        onChange={(event) =>
          onChange({ ...filters, search: event.target.value || undefined })
        }
      />
      <Select
        label="Estado lectura"
        name="read"
        value={filters.read ?? 'all'}
        options={readOptions}
        placeholder=""
        onChange={(value) =>
          onChange({
            ...filters,
            read: (value as NotificationFilters['read']) || 'all',
          })
        }
      />
      <Select
        label="Severidad"
        name="severity"
        value={filters.severity ?? ''}
        options={severityOptions}
        onChange={(value) =>
          onChange({ ...filters, severity: (value as AlertSeverity) || undefined })
        }
      />
      <Select
        label="Tipo"
        name="type"
        value={filters.type ?? ''}
        options={typeOptions}
        onChange={(value) =>
          onChange({ ...filters, type: (value as NotificationType) || undefined })
        }
      />
    </div>
  )
}
