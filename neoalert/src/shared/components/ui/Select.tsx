import { ChevronDown } from 'lucide-react'
import { cn } from '@shared/utils/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  name: string
  value: string
  options: SelectOption[]
  placeholder?: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export function Select({
  label,
  name,
  value,
  options,
  placeholder = 'Seleccionar',
  onChange,
  error,
  className,
}: SelectProps) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)} htmlFor={name}>
      {label ? <span className="text-xs font-medium text-slate-600">{label}</span> : null}
      <div className="relative">
        <select
          id={name}
          name={name}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-slate-900 shadow-sm transition-colors',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 hover:border-slate-300',
          )}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
