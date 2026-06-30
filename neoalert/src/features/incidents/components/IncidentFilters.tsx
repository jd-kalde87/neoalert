import { useState } from 'react'
import { Select } from '@shared/components/ui/Select'
import { Input } from '@shared/components/ui/Input'
import type { IncidentListFilters, IncidentSeverity, IncidentStatus } from '../types/incident.types'
import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
} from '../types/incident.types'

interface IncidentFiltersProps {
  filters: IncidentListFilters
  onChange: (filters: IncidentListFilters) => void
}

const severityOptions = Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const statusOptions = Object.entries(INCIDENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function IncidentFilters({ filters, onChange }: IncidentFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? '')

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 min-[900px]:grid-cols-[2fr_1fr_1fr]">
      <Input
        label="Buscar"
        name="search"
        placeholder="Código, título o ubicación"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          onChange({ ...filters, search: event.target.value || undefined })
        }}
      />
      <Select
        label="Nivel de riesgo"
        name="severity"
        value={filters.severity ?? ''}
        options={severityOptions}
        onChange={(value) =>
          onChange({ ...filters, severity: (value as IncidentSeverity) || undefined })
        }
      />
      <Select
        label="Estado"
        name="status"
        value={filters.status ?? ''}
        options={statusOptions}
        onChange={(value) =>
          onChange({ ...filters, status: (value as IncidentStatus) || undefined })
        }
      />
    </div>
  )
}
