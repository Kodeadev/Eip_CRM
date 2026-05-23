import { z } from 'zod'

export const reminderSchema = z.object({
  society_id: z.string().uuid({ message: 'ID de sociedad inválido' }),
  reminder_type: z.string().default('tasa_anual'),
  title: z.string().min(2, { message: 'El título debe tener al menos 2 caracteres' }),
  description: z.string().optional(),
  due_date: z.string({ message: 'Fecha de vencimiento requerida' }),
  status: z.enum(['pendiente', 'próximo', 'vencido', 'pagado', 'cancelado']).default('pendiente'),
  priority: z.enum(['baja', 'media', 'alta', 'urgente']).default('media'),
})

export type ReminderInput = z.infer<typeof reminderSchema>
