import { z } from 'zod'

export const createIncidentSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z
    .string()
    .min(10, 'Describe el incidente de seguridad y su impacto en la ruta'),
  type: z.string().min(1, 'Selecciona el tipo de incidente'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.string().min(1, 'Indica quién reporta el incidente'),
  location: z.string().min(3, 'Describe el punto en la vía o referencia geográfica'),
  latitude: z.number({ message: 'Ubica el incidente en el mapa' }),
  longitude: z.number({ message: 'Ubica el incidente en el mapa' }),
  blocksTransit: z.boolean(),
  routeName: z.string().optional(),
  targetWorkSite: z.string().optional(),
  reportedBy: z.string().optional(),
})

export type CreateIncidentFormValues = z.infer<typeof createIncidentSchema>

export const closeIncidentSchema = z.object({
  note: z.string().min(5, 'Agrega una observación de cierre'),
})

export type CloseIncidentFormValues = z.infer<typeof closeIncidentSchema>
