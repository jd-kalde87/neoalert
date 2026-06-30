import type { ReactNode } from 'react'
import { cn } from '@shared/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white shadow-sm',
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </article>
  )
}
