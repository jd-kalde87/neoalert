import { z } from 'zod'

export const createRiskSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  type: z.string().min(1, 'Selecciona el tipo de riesgo'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  latitude: z.number({ message: 'Ubica el riesgo en el mapa' }),
  longitude: z.number({ message: 'Ubica el riesgo en el mapa' }),
  municipalityId: z.string().optional(),
  departmentId: z.string().optional(),
  projectId: z.string().optional(),
  sectorId: z.string().optional(),
  source: z.string().optional(),
  reportedBy: z.string().optional(),
})

export type CreateRiskFormValues = z.infer<typeof createRiskSchema>
