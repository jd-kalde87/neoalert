import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import type { NewsFilters } from '../types/news.types'

interface NewsFiltersBarProps {
  filters: NewsFilters
  departmentOptions: { value: string; label: string }[]
  onChange: (filters: NewsFilters) => void
}

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Todas las severidades' },
  { value: 'critical', label: 'Crítica' },
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low', label: 'Baja' },
]

export function NewsFiltersBar({ filters, departmentOptions, onChange }: NewsFiltersBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input
        label="Buscar"
        name="search"
        placeholder="Actividad, municipio o departamento"
        value={filters.search ?? ''}
        onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
      />
      <Select
        label="Departamento"
        name="department"
        value={filters.departmentKey ?? ''}
        onChange={(value) =>
          onChange({
            ...filters,
            departmentKey: value || undefined,
            municipalityKey: undefined,
          })
        }
        options={[{ value: '', label: 'Todos los departamentos' }, ...departmentOptions]}
      />
      <Input
        label="Desde"
        name="dateFrom"
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={(event) => onChange({ ...filters, dateFrom: event.target.value || undefined })}
      />
      <Input
        label="Hasta"
        name="dateTo"
        type="date"
        value={filters.dateTo ?? ''}
        onChange={(event) => onChange({ ...filters, dateTo: event.target.value || undefined })}
      />
      <Select
        label="Severidad"
        name="severity"
        value={filters.severity ?? 'all'}
        onChange={(value) =>
          onChange({
            ...filters,
            severity: (value || 'all') as NewsFilters['severity'],
          })
        }
        options={SEVERITY_OPTIONS}
      />
    </div>
  )
}
