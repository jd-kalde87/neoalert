import { useState } from 'react'
import { AsyncBoundary } from '@shared/components/feedback/AsyncBoundary'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { AttendanceFilters } from '../components/AttendanceFilters'
import { AttendanceMarkForm } from '../components/AttendanceMarkForm'
import { AttendanceTable } from '../components/AttendanceTable'
import { useAttendanceRecords, useCreateAttendanceMark } from '../hooks/useAttendance'
import type { AttendanceListFilters } from '../types/attendance.types'
import type { CreateAttendanceMarkFormValues } from '../types/attendance.schema'

export function AttendancePage() {
  const [localFilters, setLocalFilters] = useState<AttendanceListFilters>({})
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const { data, isLoading, isError, refetch } = useAttendanceRecords(localFilters)
  const createMark = useCreateAttendanceMark()

  const handleSubmit = async (values: CreateAttendanceMarkFormValues) => {
    setFeedback(null)
    const record = await createMark.mutateAsync(values)

    if (record.status === 'rejected') {
      setFeedback({
        type: 'error',
        message: record.rejectedReason ?? 'Marcación rechazada por incidentes activos en la ruta.',
      })
      return
    }

    setFeedback({
      type: 'success',
      message:
        record.status === 'requires_approval'
          ? 'Marcación registrada — requiere aprobación del jefe de área.'
          : record.status === 'offline_pending'
            ? 'Marcación guardada — pendiente de sincronización.'
            : 'Marcación sincronizada correctamente.',
    })
  }

  return (
    <section>
      <PageHeader
        title="Asistencia laboral en ruta"
        description="Marcaciones con validación automática contra incidentes de seguridad activos. Supervisión para jefes de área y administradores."
      />

      {feedback ? (
        <p
          className={
            feedback.type === 'success' ? 'neo-alert-success mb-4' : 'neo-alert-error mb-4'
          }
          role="alert"
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 min-[1100px]:grid-cols-[0.95fr_1.05fr]">
        <Card padding="lg">
          <h2 className="neo-section-title mb-1.5">Registrar marcación</h2>
          <p className="mb-4 text-[0.8125rem] text-slate-500">
            Simula marcación en ruta (entrada desde planta o sitio). El sistema valida bloqueos y
            riesgos antes de sincronizar.
          </p>
          <AttendanceMarkForm onSubmit={handleSubmit} isSubmitting={createMark.isPending} />
        </Card>

        <div>
          <h2 className="neo-section-title mb-1.5">Historial y supervisión</h2>
          <AttendanceFilters filters={localFilters} onChange={setLocalFilters} />

          <AsyncBoundary
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && data?.length === 0}
            loadingTitle="Cargando marcaciones"
            errorTitle="No se pudo cargar el historial"
            emptyTitle="Sin marcaciones"
            emptyDescription="No hay registros para los filtros seleccionados."
            onRetry={() => refetch()}
          >
            {data && data.length > 0 ? <AttendanceTable records={data} /> : null}
          </AsyncBoundary>
        </div>
      </div>
    </section>
  )
}
