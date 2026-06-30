import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@shared/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-900 text-white shadow-sm hover:bg-brand-800 focus-visible:ring-brand-900/30 disabled:bg-slate-300',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-300 disabled:bg-slate-100',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/30 disabled:bg-red-300',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
