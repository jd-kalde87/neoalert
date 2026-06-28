import { z } from 'zod'

export const createAttendanceMarkSchema = z.object({
  markType: z.enum(['entry', 'exit', 'intermediate_exit', 'reentry', 'exceptional']),
  routeName: z.string().min(1, 'Selecciona la ruta'),
  targetWorkSite: z.string().min(1, 'Selecciona el sitio de trabajo'),
  siteId: z.string().optional(),
  locationLabel: z.string().min(3, 'Indica la ubicación detectada'),
  latitude: z.number(),
  longitude: z.number(),
  gpsAccuracyMeters: z.number().min(0),
  networkOnline: z.boolean(),
  justification: z.string().optional(),
  forceExceptional: z.boolean().optional(),
})

export type CreateAttendanceMarkFormValues = z.infer<typeof createAttendanceMarkSchema>
