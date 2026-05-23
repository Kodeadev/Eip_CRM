'use server'

import { createClient } from '@/lib/supabase/server'
import { DashboardService } from '@/services/dashboard.service'
import { ReminderService } from '@/services/reminder.service'

export async function handleGetDashboardData() {
  try {
    const supabase = await createClient()
    const dashboardService = new DashboardService(supabase)
    const reminderService = new ReminderService(supabase)

    const metrics = await dashboardService.getMetrics()
    const chartData = await dashboardService.getChartData()
    const reminders = await reminderService.listReminders()

    return {
      success: true,
      data: {
        metrics,
        chartData,
        reminders,
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener datos del dashboard' }
  }
}

export async function handleUpdateReminderStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    const reminderService = new ReminderService(supabase)

    let updateData: any = { status }
    
    // Si se marca como pagado o cancelado, la prioridad baja automáticamente
    if (status === 'pagado' || status === 'cancelado') {
      updateData.priority = 'baja'
    }

    await reminderService.updateReminder(id, updateData)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar recordatorio' }
  }
}
