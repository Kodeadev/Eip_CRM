'use server'

import { createClient } from '@/lib/supabase/server'
import { PaymentService } from '@/services/payment.service'
import { SocietyService } from '@/services/society.service'
import { ReminderService } from '@/services/reminder.service'
import { paymentSchema, PaymentInput } from '@/validators/payment'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function handleCreatePayment(rawData: unknown) {
  try {
    // SECURITY: Require authenticated user (admin or empleado)
    await requireAuth(['admin', 'empleado'])

    // SECURITY: Server-side Zod validation
    const parsed = paymentSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }
    const data = parsed.data

    const supabase = await createClient()
    const paymentService = new PaymentService(supabase)
    const societyService = new SocietyService(supabase)
    const reminderService = new ReminderService(supabase)

    const { new_documents, ...paymentInput } = data

    // 1. Insertar el pago
    const payment = await paymentService.createPayment(paymentInput as any)

    // 1.5. Agregar Documentos (si hay)
    if (new_documents && new_documents.length > 0) {
      await paymentService.addDocuments(payment.id, new_documents)
    }

    // 2. Actualizar las fechas de la sociedad
    await societyService.updateSociety(data.society_id, {
      last_payment_date: data.payment_date,
      next_payment_date: data.next_due_date,
    })

    // 3. Obtener o crear recordatorio
    const societyData = await societyService.getSociety(data.society_id)
    const existingReminder = await reminderService.getReminderBySociety(data.society_id)

    // Lógica para el estado del recordatorio basada en la fecha del próximo cobro
    const nextDueDateObj = new Date(data.next_due_date)
    const today = new Date()
    const diffTime = nextDueDateObj.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let reminderStatus = 'pendiente'
    let reminderPriority = 'media'

    if (diffDays < 0) {
      reminderStatus = 'vencido'
      reminderPriority = 'urgente'
    } else if (diffDays <= 30) {
      reminderStatus = 'próximo'
      reminderPriority = 'alta'
    } else {
      reminderStatus = 'pagado'
      reminderPriority = 'baja'
    }

    if (existingReminder) {
      await reminderService.updateReminder(existingReminder.id, {
        due_date: data.next_due_date,
        status: reminderStatus as any,
        priority: reminderPriority as any,
      })
    } else {
      await reminderService.createReminder({
        society_id: data.society_id,
        reminder_type: 'tasa_anual',
        title: `Pago de Tasa Anual - ${societyData.name}`,
        description: 'Recordatorio automático gestionado por el módulo de pagos.',
        due_date: data.next_due_date,
        status: reminderStatus as any,
        priority: reminderPriority as any,
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/sociedades')
    revalidatePath(`/dashboard/sociedades/${data.society_id}`)
    
    return { success: true, data: payment }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al registrar el pago' }
  }
}

export async function handleListPayments(filterType?: string) {
  try {
    // SECURITY: Require authenticated user
    await requireAuth()

    const supabase = await createClient()
    const paymentService = new PaymentService(supabase)
    const data = await paymentService.getPayments({ filterType })
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener pagos' }
  }
}

export async function handleUpdatePayment(id: string, rawData: unknown) {
  try {
    // SECURITY: Require authenticated user (admin or empleado)
    await requireAuth(['admin', 'empleado'])

    // SECURITY: Server-side Zod validation
    const parsed = paymentSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }
    const data = parsed.data

    const supabase = await createClient()
    const paymentService = new PaymentService(supabase)
    const societyService = new SocietyService(supabase)

    const { new_documents, ...paymentInput } = data

    // 1. Actualizar el pago
    const payment = await paymentService.updatePayment(id, paymentInput as any)

    // 2. Agregar Documentos (si hay)
    if (new_documents && new_documents.length > 0) {
      await paymentService.addDocuments(id, new_documents)
    }

    // 3. Actualizar fechas de la sociedad
    await societyService.updateSociety(data.society_id, {
      last_payment_date: data.payment_date,
      next_payment_date: data.next_due_date,
    })

    // 4. Actualizar recordatorio
    const reminderService = new ReminderService(supabase)
    const existingReminder = await reminderService.getReminderBySociety(data.society_id)
    const societyData = await societyService.getSociety(data.society_id)

    const nextDueDateObj = new Date(data.next_due_date)
    const today = new Date()
    const diffTime = nextDueDateObj.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let reminderStatus = 'pendiente'
    let reminderPriority = 'media'

    if (diffDays < 0) {
      reminderStatus = 'vencido'
      reminderPriority = 'urgente'
    } else if (diffDays <= 30) {
      reminderStatus = 'próximo'
      reminderPriority = 'alta'
    } else {
      reminderStatus = 'pagado'
      reminderPriority = 'baja'
    }

    if (existingReminder) {
      await reminderService.updateReminder(existingReminder.id, {
        due_date: data.next_due_date,
        status: reminderStatus as any,
        priority: reminderPriority as any,
      })
    } else {
      await reminderService.createReminder({
        society_id: data.society_id,
        reminder_type: 'tasa_anual',
        title: `Pago de Tasa Anual - ${societyData.name}`,
        description: 'Recordatorio automático gestionado por el módulo de pagos.',
        due_date: data.next_due_date,
        status: reminderStatus as any,
        priority: reminderPriority as any,
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/pagos')
    revalidatePath('/dashboard/sociedades')
    revalidatePath(`/dashboard/sociedades/${data.society_id}`)
    
    return { success: true, data: payment }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el pago' }
  }
}
