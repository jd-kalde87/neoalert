import { Construction } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { PageHeader } from '@shared/components/layout/PageHeader'

interface ModulePlaceholderProps {
  title: string
  description: string
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <section>
      <PageHeader title={title} description={description} />
      <Card padding="lg" className="flex flex-col items-center gap-3 py-16 text-center">
        <Construction className="size-10 text-slate-300" aria-hidden />
        <p className="text-sm text-slate-500">Módulo preparado para desarrollo incremental.</p>
      </Card>
    </section>
  )
}
