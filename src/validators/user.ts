import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: z.enum(['admin', 'empleado', 'cliente'], { message: 'Rol inválido' }),
})

export const editUserSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).optional().or(z.literal('')),
  role: z.enum(['admin', 'empleado', 'cliente'], { message: 'Rol inválido' }),
})

export type UserInput = z.infer<typeof userSchema>
export type EditUserInput = z.infer<typeof editUserSchema>
