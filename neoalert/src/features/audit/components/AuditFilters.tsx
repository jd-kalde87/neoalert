import { useState } from 'react'
import { Input } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import type { AuditAction, AuditEntity, AuditListFilters, AuditOutcome } from '../types/audit.types'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_OUTCOME_LABELS,
} from '../types/audit.types'

interface AuditFiltersProps {
  filters: AuditListFilters
  onChange: (filters: AuditListFilters) => void
}

const entityOptions = Object.entries(AUDIT_ENTITY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const actionOptions = Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const outcomeOptions = Object.entries(AUDIT_OUTCOME_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? '')

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 min-[1100px]:grid-cols-[1.4fr_1fr_repeat(3,minmax(0,1fr))]">
      <Input
        label="Buscar"
        name="search"
        placeholder="Resumen, entidad, actor o ID"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          onChange({ ...filters, search: event.target.value || undefined })
        }}
      />
      <Input
        label="Actor"
        name="actor"
        placeholder="Nombre del usuario"
        value={filters.actor ?? ''}
        onChange={(event) =>
          onChange({ ...filters, actor: event.target.value || undefined })
        }
      />
      <Select
        label="Entidad"
        name="entity"
        value={filters.entity ?? ''}
        options={entityOptions}
        onChange={(value) =>
          onChange({ ...filters, entity: (value as AuditEntity) || undefined })
        }
      />
      <Select
        label="Acción"
        name="action"
        value={filters.action ?? ''}
        options={actionOptions}
        onChange={(value) =>
          onChange({ ...filters, action: (value as AuditAction) || undefined })
        }
      />
      <Select
        label="Resultado"
        name="outcome"
        value={filters.outcome ?? ''}
        options={outcomeOptions}
        onChange={(value) =>
          onChange({ ...filters, outcome: (value as AuditOutcome) || undefined })
        }
      />
    </div>
  )
}
