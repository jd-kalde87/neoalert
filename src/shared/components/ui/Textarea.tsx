import { cn } from '@shared/utils/cn'

interface TextareaProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  rows?: number
  placeholder?: string
  className?: string
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  error,
  rows = 4,
  placeholder,
  className,
}: TextareaProps) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)} htmlFor={name}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <textarea
        id={name}
        name={name}
        className={cn(
          'w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors',
          'placeholder:text-slate-400',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-200 hover:border-slate-300',
        )}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
