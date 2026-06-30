import type { ReactNode } from 'react'
import { cn } from '@shared/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-panel',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </article>
  )
}
