'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ReminderEngineService } from '@/services/reminder-engine.service'
import { requireAuth, requireAdmin } from '@/lib/auth-guard'

/**
 * Helper: Service-role Supabase client for engine operations that need
 * to bypass RLS (e.g., recalculating ALL reminders across societies).
 */
function getServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )
}

/**
 * Helper: Session-based Supabase client for user-scoped operations.
 */
async function getSessionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Under static generation or server routing environments
          }
        },
      },
    }
  )
}

export async function handleGetRemindersDashboard() {
  try {
    // SECURITY: Require authenticated user
    await requireAuth()

    const supabase = getServiceRoleClient()
    
    // 1. Fetch reminders with society details
    const { data: reminders, error: remError } = await supabase
      .from('reminders')
      .select('*, societies(name, ruc, email, phone)')
      .order('due_date', { ascending: true })

    if (remError) throw remError

    // 2. Fetch reminder settings/rules
    const { data: settings, error: setError } = await supabase
      .from('reminder_settings')
      .select('*')
      .order('days_before', { ascending: false })

    if (setError) throw setError

    // 3. Fetch active notification providers
    const { data: providers, error: provError } = await supabase
      .from('notification_providers')
      .select('*')

    if (provError) throw provError

    // 4. Fetch notification delivery logs
    const { data: logs, error: logsError } = await supabase
      .from('reminder_notifications')
      .select('*, reminders(title)')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (logsError) throw logsError

    return {
      success: true,
      reminders: reminders || [],
      settings: settings || [],
      providers: providers || [],
      logs: logs || []
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al cargar recordatorios' }
  }
}

export async function handleSendManualReminder(reminderId: string, channel: 'email' | 'whatsapp') {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    // SECURITY: Validate inputs
    if (!reminderId || typeof reminderId !== 'string') {
      return { success: false, error: 'ID de recordatorio inválido' }
    }
    if (!['email', 'whatsapp'].includes(channel)) {
      return { success: false, error: 'Canal de notificación inválido' }
    }

    const supabase = getServiceRoleClient()
    const engine = new ReminderEngineService(supabase)
    
    const result = await engine.sendManualReminder(reminderId, channel)
    if (!result.success) throw new Error(result.error)

    revalidatePath('/dashboard/recordatorios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al enviar recordatorio manual' }
  }
}

// SECURITY: Zod schema for reminder settings validation (HIGH-05 fix)
const reminderSettingSchema = z.object({
  id: z.string().uuid(),
  days_before: z.number().int().min(0).max(365),
  auto_priority: z.enum(['low', 'medium', 'high', 'critical']),
  channels: z.array(z.enum(['email', 'whatsapp'])),
  is_active: z.boolean(),
})
const reminderSettingsListSchema = z.array(reminderSettingSchema)

export async function handleUpdateReminderSettings(rawData: unknown) {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    // SECURITY: Server-side Zod validation
    const parsed = reminderSettingsListSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos de configuración inválidos' }
    }
    const settingsList = parsed.data

    const supabase = getServiceRoleClient()
    
    for (const item of settingsList) {
      const { error } = await supabase
        .from('reminder_settings')
        .update({
          days_before: item.days_before,
          auto_priority: item.auto_priority,
          channels: item.channels,
          is_active: item.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)

      if (error) throw error
    }

    // Trigger states recalculation immediately after changing settings rules
    const engine = new ReminderEngineService(supabase)
    await engine.recalculateReminderStates()

    revalidatePath('/dashboard/recordatorios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar configuraciones' }
  }
}

export async function handleMarkAsPaid(reminderId: string) {
  try {
    // SECURITY: Require authenticated user (admin or empleado)
    await requireAuth(['admin', 'empleado'])

    if (!reminderId || typeof reminderId !== 'string') {
      return { success: false, error: 'ID de recordatorio inválido' }
    }

    const supabase = getServiceRoleClient()
    
    // Fetch current reminder to get society ID and due date
    const { data: reminder, error: fetchError } = await supabase
      .from('reminders')
      .select('society_id, due_date')
      .eq('id', reminderId)
      .single()

    if (fetchError) throw fetchError

    // Mark reminder as paid
    const { error: remError } = await supabase
      .from('reminders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)

    if (remError) throw remError

    // Calculate next year's due date
    const currentDueDate = new Date(reminder.due_date)
    const nextYearDueDate = new Date(currentDueDate.setFullYear(currentDueDate.getFullYear() + 1))
    const formattedNextDate = nextYearDueDate.toISOString().split('T')[0]

    // Update society next_payment_date and last_payment_date in societies table
    const { error: socError } = await supabase
      .from('societies')
      .update({
        last_payment_date: reminder.due_date,
        next_payment_date: formattedNextDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminder.society_id)

    if (socError) throw socError

    // Recalculate reminders immediately
    const engine = new ReminderEngineService(supabase)
    await engine.recalculateReminderStates()

    revalidatePath('/dashboard/recordatorios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al registrar pago' }
  }
}

export async function handleRecalculateEngine() {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    const supabase = getServiceRoleClient()
    const engine = new ReminderEngineService(supabase)
    const result = await engine.recalculateReminderStates()
    
    if (!result.success) throw new Error(result.error)

    revalidatePath('/dashboard/recordatorios')
    return { success: true, count: result.count }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al recalcular recordatorios' }
  }
}

export async function handleToggleProviderStatus(providerId: string, isActive: boolean) {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    if (!providerId || typeof providerId !== 'string') {
      return { success: false, error: 'ID de proveedor inválido' }
    }
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido' }
    }

    const supabase = getServiceRoleClient()
    const { error } = await supabase
      .from('notification_providers')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)

    if (error) throw error

    revalidatePath('/dashboard/recordatorios')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al cambiar estado del proveedor' }
  }
}
