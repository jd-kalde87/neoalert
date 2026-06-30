import type { ReactNode } from 'react'
import { AlertCircle, Inbox, Loader2 } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'

interface FeedbackProps {
  title: string
  description?: string
  action?: ReactNode
}

export function LoadingState({ title, description }: FeedbackProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-8 animate-spin text-brand-900" aria-hidden />
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? <p className="max-w-md text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}

export function EmptyState({ title, description, action }: FeedbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <Inbox className="size-8 text-slate-300" aria-hidden />
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? <p className="max-w-md text-sm text-slate-500">{description}</p> : null}
      {action}
    </div>
  )
}

export function ErrorState({ title, description, action }: FeedbackProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/50 px-6 py-12 text-center"
      role="alert"
    >
      <AlertCircle className="size-8 text-red-500" aria-hidden />
      <h2 className="text-base font-semibold text-red-900">{title}</h2>
      {description ? <p className="max-w-md text-sm text-red-700">{description}</p> : null}
      {action}
    </div>
  )
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      Reintentar
    </Button>
  )
}
