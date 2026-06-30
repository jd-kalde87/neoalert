import { Card } from '@shared/components/ui/Card'
import { cn } from '@shared/utils/cn'
import { TrendingDown, TrendingUp } from 'lucide-react'

export type KpiTrendDirection = 'up' | 'down' | 'neutral'
export type KpiVariant = 'default' | 'success' | 'warning' | 'danger'

export interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  trend?: {
    direction: KpiTrendDirection
    label: string
  }
  variant?: KpiVariant
  className?: string
}

const variantClasses: Record<KpiVariant, string> = {
  default: 'border-slate-200/70 bg-gradient-to-br from-white to-slate-50/80',
  success: 'border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/70',
  warning: 'border-amber-200/80 bg-gradient-to-br from-white to-amber-50/70',
  danger: 'border-red-200/80 bg-gradient-to-br from-white to-red-50/70',
}

const valueClasses: Record<KpiVariant, string> = {
  default: 'text-slate-900',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
}

export function KpiCard({ label, value, hint, trend, variant = 'default', className }: KpiCardProps) {
  return (
    <Card className={cn(variantClasses[variant], className)} padding="md">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn('mt-2 text-3xl font-semibold tracking-tight tabular-nums', valueClasses[variant])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {trend ? (
        <p
          className={cn(
            'mt-2 flex items-center gap-1 text-xs font-medium',
            trend.direction === 'up' && 'text-emerald-600',
            trend.direction === 'down' && 'text-red-600',
            trend.direction === 'neutral' && 'text-slate-500',
          )}
        >
          {trend.direction === 'up' ? <TrendingUp className="size-3.5" /> : null}
          {trend.direction === 'down' ? <TrendingDown className="size-3.5" /> : null}
          {trend.label}
        </p>
      ) : null}
    </Card>
  )
}
