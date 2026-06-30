import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@shared/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, description, children, size = 'lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Cerrar modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="neo-modal-title"
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
          sizeClasses[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="neo-modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="neo-scroll overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
