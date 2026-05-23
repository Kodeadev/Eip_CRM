export type ReminderStatus = 'pendiente' | 'próximo' | 'vencido' | 'pagado' | 'cancelado'
export type ReminderPriority = 'baja' | 'media' | 'alta' | 'urgente'

export interface Reminder {
  id: string
  society_id: string
  reminder_type: string
  title: string
  description?: string
  due_date: string
  status: ReminderStatus
  priority: ReminderPriority
  last_notification_sent?: string
  created_at: string
  updated_at: string
}

export interface ReminderLog {
  id: string
  reminder_id: string
  action: string
  description?: string
  created_at: string
}
