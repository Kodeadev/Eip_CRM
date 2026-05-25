import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, { message: 'El usuario debe tener al menos 3 caracteres' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
})

export type LoginInput = z.infer<typeof loginSchema>
