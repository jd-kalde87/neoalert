import { z } from 'zod'

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Ingresa tu correo electrónico.')
      .email('Ingresa un correo electrónico válido.'),
    fullName: z
      .string()
      .trim()
      .min(1, 'Ingresa tu nombre completo.')
      .max(200, 'El nombre no puede superar 200 caracteres.'),
    username: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || value.length >= 3, {
        message: 'El usuario debe tener al menos 3 caracteres.',
      })
      .refine((value) => !value || value.length <= 64, {
        message: 'El usuario no puede superar 64 caracteres.',
      })
      .refine((value) => !value || /^[a-zA-Z0-9._-]+$/.test(value), {
        message: 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos.',
      }),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/[A-Z]/, 'Incluye al menos una letra mayúscula.')
      .regex(/[a-z]/, 'Incluye al menos una letra minúscula.')
      .regex(/[0-9]/, 'Incluye al menos un número.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
