'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { ReminderEngineService } from '@/services/reminder-engine.service'

/**
 * Helper to initialize a Supabase client inside Server Actions
 */
async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for backend engine operations
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
    const supabase = await getSupabaseServer()
    
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
    console.error('Error in handleGetRemindersDashboard:', err)
    return { success: false, error: err.message || 'Error al cargar recordatorios' }
  }
}

export async function handleSendManualReminder(reminderId: string, channel: 'email' | 'whatsapp') {
  try {
    const supabase = await getSupabaseServer()
    const engine = new ReminderEngineService(supabase)
    
    const result = await engine.sendManualReminder(reminderId, channel)
    if (!result.success) throw new Error(result.error)

    revalidatePath('/dashboard/recordatorios')
    return { success: true }
  } catch (err: any) {
    console.error('Error in handleSendManualReminder:', err)
    return { success: false, error: err.message || 'Error al enviar recordatorio manual' }
  }
}

export async function handleUpdateReminderSettings(settingsList: any[]) {
  try {
    const supabase = await getSupabaseServer()
    
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
    console.error('Error in handleUpdateReminderSettings:', err)
    return { success: false, error: err.message || 'Error al actualizar configuraciones' }
  }
}

export async function handleMarkAsPaid(reminderId: string) {
  try {
    const supabase = await getSupabaseServer()
    
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
    console.error('Error in handleMarkAsPaid:', err)
    return { success: false, error: err.message || 'Error al registrar pago' }
  }
}

export async function handleRecalculateEngine() {
  try {
    const supabase = await getSupabaseServer()
    const engine = new ReminderEngineService(supabase)
    const result = await engine.recalculateReminderStates()
    
    if (!result.success) throw new Error(result.error)

    revalidatePath('/dashboard/recordatorios')
    return { success: true, count: result.count }
  } catch (err: any) {
    console.error('Error in handleRecalculateEngine:', err)
  }
}

export async function handleToggleProviderStatus(providerId: string, isActive: boolean) {
  try {
    const supabase = await getSupabaseServer()
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
    console.error('Error in handleToggleProviderStatus:', err)
    return { success: false, error: err.message || 'Error al cambiar estado del proveedor' }
  }
}
