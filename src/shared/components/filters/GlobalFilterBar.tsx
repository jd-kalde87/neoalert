import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Building2,
  Calendar,
  ChevronDown,
  Filter,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { useFilterStore } from '@shared/stores/filterStore'
import { useUiStore } from '@shared/stores/uiStore'
import {
  COUNTRY_OPTIONS,
  EVENT_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  TENANT_OPTIONS,
} from '@shared/constants/filter-options'
import {
  useDepartmentSelectOptions,
  useMunicipalityOptions,
  useProjectOptions,
} from '@shared/hooks/useOperations'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/utils/cn'

function FilterField({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string
  icon?: typeof Filter
  value?: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
        {Icon ? <Icon className="size-3 shrink-0" /> : null}
        {label}
      </span>
      <select
        className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
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

function FilterDateField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
        <Calendar className="size-3 shrink-0" />
        {label}
      </span>
      <input
        className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-800 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        type="date"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function FilterGroup({
  title,
  children,
  className,
  compact,
}: {
  title: string
  children: ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </legend>
      <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
        {children}
      </div>
    </fieldset>
  )
}

export function GlobalFilterBar() {
  const location = useLocation()
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const filters = useFilterStore((state) => state.filters)
  const setFilters = useFilterStore((state) => state.setFilters)
  const resetFilters = useFilterStore((state) => state.resetFilters)

  const isMapRoute = location.pathname.startsWith('/maps')
  const sidebarExpanded = !sidebarCollapsed

  const [filtersOpen, setFiltersOpen] = useState(!isMapRoute)

  useEffect(() => {
    setFiltersOpen(!isMapRoute)
  }, [isMapRoute])

  const projectOptions = useProjectOptions(filters.countryCode)
  const departmentOptions = useDepartmentSelectOptions({
    countryCode: filters.countryCode,
    projectId: filters.projectId,
    municipalityId: filters.municipalityId,
  })
  const municipalityOptions = useMunicipalityOptions(filters.countryCode)

  const activeCount = useMemo(
    () =>
      [
        filters.tenantId,
        filters.countryCode,
        filters.projectId,
        filters.municipalityId,
        filters.departmentId,
        filters.sectorId,
        filters.eventType,
      ].filter(Boolean).length,
    [filters],
  )

  const gridClass = sidebarExpanded
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'

  return (
    <section
      className={cn(
        'border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/90 px-3 lg:px-4',
        filtersOpen ? 'py-2.5' : 'py-1.5',
        isMapRoute && !filtersOpen && 'bg-white',
      )}
      aria-label="Filtros globales"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition-colors hover:bg-slate-100/80 sm:flex-none sm:pr-2"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-900 text-white">
            <SlidersHorizontal className="size-3.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Filtros globales</h2>
            <p className="truncate text-xs text-slate-500">
              {activeCount > 0 ? `${activeCount} filtro(s) activo(s)` : 'Sin filtros adicionales'}
              {isMapRoute && !filtersOpen ? ' · Clic para expandir' : null}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'ml-1 size-4 shrink-0 text-slate-400 transition-transform',
              filtersOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {filtersOpen ? (
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              <RotateCcw className="size-3.5" />
              Restablecer
            </Button>
          ) : null}
        </div>
      </div>

      {filtersOpen ? (
        <div className={cn('mt-3 grid gap-4', gridClass)}>
          <FilterGroup title="Organización" compact={sidebarExpanded}>
            <FilterField
              label="Tenant"
              value={filters.tenantId}
              options={TENANT_OPTIONS}
              onChange={(tenantId) => setFilters({ tenantId: tenantId || undefined })}
            />
            <FilterField
              label="País"
              value={filters.countryCode}
              options={COUNTRY_OPTIONS}
              onChange={(countryCode) =>
                setFilters({
                  countryCode: countryCode || undefined,
                  projectId: undefined,
                  departmentId: undefined,
                  municipalityId: undefined,
                })
              }
            />
          </FilterGroup>

          <FilterGroup title="Territorio" compact={sidebarExpanded}>
            <FilterField
              label="Proyecto"
              icon={Building2}
              value={filters.projectId}
              options={projectOptions}
              onChange={(projectId) =>
                setFilters({
                  projectId: projectId || undefined,
                  departmentId: undefined,
                })
              }
            />
            <FilterField
              label="Departamento"
              icon={MapPin}
              value={filters.departmentId}
              options={departmentOptions}
              onChange={(departmentId) => setFilters({ departmentId: departmentId || undefined })}
            />
            <FilterField
              label="Municipio"
              value={filters.municipalityId}
              options={municipalityOptions}
              onChange={(municipalityId) =>
                setFilters({ municipalityId: municipalityId || undefined })
              }
            />
            <FilterField
              label="Sector"
              value={filters.sectorId}
              options={SECTOR_OPTIONS}
              onChange={(sectorId) => setFilters({ sectorId: sectorId || undefined })}
            />
          </FilterGroup>

          <FilterGroup title="Riesgos" compact={sidebarExpanded}>
            <FilterField
              label="Tipo de evento"
              icon={Filter}
              value={filters.eventType}
              options={EVENT_TYPE_OPTIONS}
              onChange={(eventType) => setFilters({ eventType: eventType || undefined })}
            />
          </FilterGroup>

          <FilterGroup title="Período" compact={sidebarExpanded}>
            <FilterDateField
              label="Desde"
              value={filters.dateFrom}
              onChange={(dateFrom) => setFilters({ dateFrom })}
            />
            <FilterDateField
              label="Hasta"
              value={filters.dateTo}
              onChange={(dateTo) => setFilters({ dateTo })}
            />
          </FilterGroup>
        </div>
      ) : null}
    </section>
  )
}
