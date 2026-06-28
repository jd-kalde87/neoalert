import type { ReactNode } from 'react'
import { ErrorState, EmptyState, LoadingState, RetryButton } from './LoadingState'

export { LoadingState, EmptyState, ErrorState }

interface AsyncBoundaryProps {
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  loadingTitle?: string
  errorTitle?: string
  emptyTitle?: string
  errorDescription?: string
  emptyDescription?: string
  onRetry?: () => void
  children: ReactNode
}

export function AsyncBoundary({
  isLoading = false,
  isError = false,
  isEmpty = false,
  loadingTitle = 'Cargando información',
  errorTitle = 'No se pudo cargar la información',
  emptyTitle = 'No hay datos disponibles',
  errorDescription,
  emptyDescription,
  onRetry,
  children,
}: AsyncBoundaryProps) {
  if (isLoading) {
    return <LoadingState title={loadingTitle} />
  }

  if (isError) {
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription}
        action={onRetry ? <RetryButton onClick={onRetry} /> : undefined}
      />
    )
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return <>{children}</>
}
