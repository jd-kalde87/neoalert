import type { ReactNode } from 'react'
import { cn } from '@shared/utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="max-w-3xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}
