import { Link } from 'react-router-dom'
import { Card } from '@shared/components/ui/Card'
import { ROUTES } from '@shared/constants/routes'
import { REPORT_TYPE_META, type ReportType } from '../types/report.types'

const REPORT_TYPES: ReportType[] = ['attendance', 'security-incidents', 'route-safety']

export function ReportsHub() {
  return (
    <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-3">
      {REPORT_TYPES.map((type) => {
        const meta = REPORT_TYPE_META[type]
        return (
          <Card key={type} padding="lg">
            <h2 className="mb-1.5 text-[1.0625rem] font-semibold">{meta.title}</h2>
            <p className="mb-4 text-sm text-slate-500">{meta.description}</p>
            <Link to={ROUTES.reportDetail.replace(':reportType', type)} className="font-bold no-underline">
              Ver reporte →
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
