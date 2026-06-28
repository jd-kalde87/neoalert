import { Filter, RotateCcw } from 'lucide-react'
import { useFilterStore } from '@shared/stores/filterStore'
import {
  COUNTRY_OPTIONS,
  CREW_OPTIONS,
  EVENT_TYPE_OPTIONS,
  SITE_OPTIONS,
  TENANT_OPTIONS,
  ZONE_OPTIONS,
} from '@shared/constants/filter-options'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/utils/cn'

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value?: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function FilterDate({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        type="date"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

export function GlobalFilterBar() {
  const filters = useFilterStore((state) => state.filters)
  const setFilters = useFilterStore((state) => state.setFilters)
  const resetFilters = useFilterStore((state) => state.resetFilters)

  return (
    <section
      className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm lg:px-5"
      aria-label="Filtros globales"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Filter className="size-3.5" />
          Filtros globales
        </div>
        <Button variant="secondary" size="sm" onClick={resetFilters} className="self-end lg:self-auto">
          <RotateCcw className="size-3.5" />
          Restablecer
        </Button>
      </div>

      <div className={cn('neo-scroll mt-3 flex gap-3 overflow-x-auto pb-1')}>
        <FilterSelect
          label="Tenant"
          value={filters.tenantId}
          options={TENANT_OPTIONS}
          onChange={(tenantId) => setFilters({ tenantId: tenantId || undefined })}
        />
        <FilterSelect
          label="País"
          value={filters.countryCode}
          options={COUNTRY_OPTIONS}
          onChange={(countryCode) => setFilters({ countryCode: countryCode || undefined })}
        />
        <FilterSelect
          label="Corredor"
          value={filters.zoneId}
          options={ZONE_OPTIONS}
          onChange={(zoneId) => setFilters({ zoneId: zoneId || undefined })}
        />
        <FilterSelect
          label="Sitio de trabajo"
          value={filters.siteId}
          options={SITE_OPTIONS}
          onChange={(siteId) => setFilters({ siteId: siteId || undefined })}
        />
        <FilterSelect
          label="Cuadrilla"
          value={filters.crewId}
          options={CREW_OPTIONS}
          onChange={(crewId) => setFilters({ crewId: crewId || undefined })}
        />
        <FilterSelect
          label="Tipo evento"
          value={filters.eventType}
          options={EVENT_TYPE_OPTIONS}
          onChange={(eventType) => setFilters({ eventType: eventType || undefined })}
        />
        <FilterDate
          label="Desde"
          value={filters.dateFrom}
          onChange={(dateFrom) => setFilters({ dateFrom })}
        />
        <FilterDate
          label="Hasta"
          value={filters.dateTo}
          onChange={(dateTo) => setFilters({ dateTo })}
        />
      </div>
    </section>
  )
}
