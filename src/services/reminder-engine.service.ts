import { SupabaseClient } from '@supabase/supabase-js'
import { NotificationService } from './notification.service'
import { differenceInDays, parseISO, format } from 'date-fns'

export class ReminderEngineService {
  private notificationService: NotificationService

  constructor(private supabase: SupabaseClient) {
    this.notificationService = new NotificationService(supabase)
  }

  /**
   * Recalculates reminder status and priority for all societies.
   * Creates reminders for active societies and cleans up non-active ones.
   */
  async recalculateReminderStates(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      console.log('Starting reminder states recalculation...')
      
      // 1. Fetch active societies
      const { data: societies, error: socError } = await this.supabase
        .from('societies')
        .select('*')
      
      if (socError) throw socError
      if (!societies) return { success: true, count: 0 }

      // 2. Fetch reminder settings/rules
      const { data: settings, error: setError } = await this.supabase
        .from('reminder_settings')
        .select('*')
        .eq('is_active', true)
        .order('days_before', { ascending: false })

      if (setError) throw setError

      let updatedCount = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const society of societies) {
        const isActive = society.status === 'activa'
        const hasDate = !!society.next_payment_date

        if (!isActive || !hasDate) {
          // If society is not active or has no payment date, remove existing reminders
          await this.supabase
            .from('reminders')
            .delete()
            .eq('society_id', society.id)
          continue
        }

        // Calculate days remaining
        const dueDate = parseISO(society.next_payment_date)
        dueDate.setHours(0, 0, 0, 0)
        const daysRemaining = differenceInDays(dueDate, today)

        // Determine status and priority based on days remaining and settings
        let status: 'pending' | 'upcoming' | 'overdue' | 'paid' | 'cancelled' = 'pending'
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'

        if (daysRemaining <= 0) {
          status = 'overdue'
          priority = 'critical'
        } else {
          // Find matching rule
          const matchingRule = settings.find(rule => daysRemaining <= rule.days_before)
          if (matchingRule) {
            status = 'upcoming'
            priority = (matchingRule.auto_priority as any) || 'medium'
          } else {
            status = 'pending'
            priority = 'low'
          }
        }

        // Upsert reminder entry
        const title = `Vencimiento de Tasa Anual - ${society.name}`
        const description = `La tasa anual para la sociedad ${society.name} (RUC: ${society.ruc}) vence el ${format(dueDate, 'dd/MM/yyyy')}. Quedan ${daysRemaining} días.`

        const { data: existingReminder } = await this.supabase
          .from('reminders')
          .select('id, status')
          .eq('society_id', society.id)
          .maybeSingle()

        if (existingReminder) {
          // If society paid in full (e.g. next_payment_date is far in the future), set status to paid
          let finalStatus: 'pending' | 'upcoming' | 'overdue' | 'paid' | 'cancelled' = status
          if ((existingReminder.status === 'paid' || existingReminder.status === 'pagado') && daysRemaining > 30) {
            // Keep it paid until it gets closer again
            finalStatus = 'paid'
          }

          await this.supabase
            .from('reminders')
            .update({
              title,
              description,
              due_date: society.next_payment_date,
              status: finalStatus,
              priority,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingReminder.id)
        } else {
          await this.supabase
            .from('reminders')
            .insert({
              society_id: society.id,
              reminder_type: 'tasa_anual',
              title,
              description,
              due_date: society.next_payment_date,
              status,
              priority
            })
        }
        updatedCount++
      }

      console.log(`Recalculation finished. Successfully processed ${updatedCount} societies.`)
      return { success: true, count: updatedCount }
    } catch (err: any) {
      console.error('Error recalculating reminder states:', err?.message || err, err?.stack)
      return { success: false, error: err?.message || 'Error desconocido al recalcular recordatorios' }
    }
  }

  /**
   * Scans reminders and triggers active automated alerts (Email, WhatsApp)
   * based on active rules in reminder_settings.
   */
  async processDueNotifications(): Promise<{ success: boolean; sent?: number; error?: string }> {
    try {
      console.log('Processing automated reminder notifications...')
      
      // Recalculate first to ensure exact states
      await this.recalculateReminderStates()

      // Fetch active reminders (pending, upcoming, overdue)
      const { data: reminders, error: remError } = await this.supabase
        .from('reminders')
        .select('*, societies(name, ruc, email, phone)')
        .in('status', ['pending', 'upcoming', 'overdue'])

      if (remError) throw remError
      if (!reminders || reminders.length === 0) {
        return { success: true, sent: 0 }
      }

      // Fetch active settings rules
      const { data: settings, error: setError } = await this.supabase
        .from('reminder_settings')
        .select('*')
        .eq('is_active', true)

      if (setError) throw setError

      // Fetch active SMTP and Twilio providers to get the admin recipient details
      const emailProvider = await this.notificationService.getActiveProvider('email_smtp')
      const twilioProvider = await this.notificationService.getActiveProvider('whatsapp_twilio')

      const adminEmail = emailProvider?.config?.admin_recipient_email || 'info@expatimmigrationpanama.com'
      const adminPhone = twilioProvider?.config?.admin_recipient_phone || '+507 67256030'

      let sentCount = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const reminder of reminders) {
        const dueDate = parseISO(reminder.due_date)
        dueDate.setHours(0, 0, 0, 0)
        const daysRemaining = differenceInDays(dueDate, today)

        // Find which rule matching this daysRemaining is currently triggered
        const matchingRule = settings.find(rule => daysRemaining === rule.days_before || (daysRemaining < 0 && rule.days_before === 0))
        if (!matchingRule) continue

        const channels: string[] = matchingRule.channels || []

        for (const channel of channels) {
          // Check if notification has already been sent for this threshold
          const { data: alreadySent } = await this.supabase
            .from('reminder_notifications')
            .select('id')
            .eq('reminder_id', reminder.id)
            .eq('channel', channel)
            .eq('status', 'sent')
            .gte('sent_at', format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd HH:mm:ss')) // Within last 24h
            .maybeSingle()

          if (alreadySent) continue

          let success = false
          let errorMessage: string | undefined

          const society = reminder.societies
          const societyName = society?.name || 'Sociedad'
          const ruc = society?.ruc || 'N/A'

          if (channel === 'email') {
            const subject = `[RECORDATORIO] Expiración de Tasa Anual - ${societyName}`
            const bodyHtml = `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #d32f2f;">Alerta de Vencimiento Administrativo</h2>
                <p>Estimado Administrador,</p>
                <p>Se le notifica que la tasa anual para la siguiente sociedad está próxima a expirar o ha expirado:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="background: #f5f5f5;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Sociedad:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${societyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">RUC:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${ruc}</td>
                  </tr>
                  <tr style="background: #f5f5f5;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Fecha de Vencimiento:</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #d32f2f; font-weight: bold;">${format(dueDate, 'dd/MM/yyyy')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Días Restantes:</td>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${daysRemaining <= 0 ? 'VENCIDA hace ' + Math.abs(daysRemaining) + ' días' : daysRemaining + ' días'}</td>
                  </tr>
                </table>
                <p>Por favor, póngase en contacto con el cliente para gestionar el cobro y pago correspondiente.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #777;">EIP & Associates CRM - Módulo de Control de Tasas Anuales</p>
              </div>
            `
            const result = await this.notificationService.sendEmail(adminEmail, subject, bodyHtml)
            success = result.success
            errorMessage = result.error
          } else if (channel === 'whatsapp') {
            const statusMsg = daysRemaining <= 0 ? `VENCIDO hace ${Math.abs(daysRemaining)} días` : `vence en ${daysRemaining} días`
            const body = `⚠️ *ALERTA ADMINISTRATIVA: TASA ANUAL*\n\nLa sociedad *${societyName}* (RUC: ${ruc}) ${statusMsg} (Fecha límite: ${format(dueDate, 'dd/MM/yyyy')}).\n\nPor favor, contactar al cliente de inmediato.\n\n_EIP & Associates CRM_`
            const result = await this.notificationService.sendWhatsApp(adminPhone, body)
            success = result.success
            errorMessage = result.error
          }

          // Insert log into reminder_notifications table
          await this.supabase
            .from('reminder_notifications')
            .insert({
              reminder_id: reminder.id,
              channel,
              status: success ? 'sent' : 'failed',
              error_message: errorMessage || null,
              sent_at: new Date().toISOString()
            })

          if (success) {
            sentCount++
            // Update last notification timestamp in reminders table
            await this.supabase
              .from('reminders')
              .update({ last_notification_sent: new Date().toISOString() })
              .eq('id', reminder.id)
          }
        }
      }

      console.log(`Process due notifications completed. Sent ${sentCount} messages.`)
      return { success: true, sent: sentCount }
    } catch (err: any) {
      console.error('Error processing due notifications:', err?.message || err, err?.stack)
      return { success: false, error: err?.message || 'Error al procesar recordatorios automatizados' }
    }
  }

  /**
   * Triggers an immediate manual notification for a specific reminder and channel.
   */
  async sendManualReminder(reminderId: string, channel: 'email' | 'whatsapp'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Sending manual reminder ${reminderId} via ${channel}...`)
      
      const { data: reminder, error: remError } = await this.supabase
        .from('reminders')
        .select('*, societies(name, ruc, email, phone)')
        .eq('id', reminderId)
        .single()

      if (remError) throw remError

      // Fetch active SMTP and Twilio providers
      const emailProvider = await this.notificationService.getActiveProvider('email_smtp')
      const twilioProvider = await this.notificationService.getActiveProvider('whatsapp_twilio')

      const adminEmail = emailProvider?.config?.admin_recipient_email || 'info@expatimmigrationpanama.com'
      const adminPhone = twilioProvider?.config?.admin_recipient_phone || '+507 67256030'

      const dueDate = parseISO(reminder.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)
      const daysRemaining = differenceInDays(dueDate, today)

      const society = reminder.societies
      const societyName = society?.name || 'Sociedad'
      const ruc = society?.ruc || 'N/A'

      let success = false
      let errorMessage: string | undefined

      if (channel === 'email') {
        const subject = `[MANUAL] Recordatorio de Tasa Anual - ${societyName}`
        const bodyHtml = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0288d1;">Recordatorio Manual de Vencimiento</h2>
            <p>Estimado Administrador,</p>
            <p>Este es un aviso manual solicitado desde el CRM respecto a la tasa anual de la siguiente sociedad:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Sociedad:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${societyName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">RUC:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${ruc}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Fecha de Vencimiento:</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${format(dueDate, 'dd/MM/yyyy')}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Días Restantes:</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${daysRemaining <= 0 ? 'VENCIDA hace ' + Math.abs(daysRemaining) + ' días' : daysRemaining + ' días'}</td>
              </tr>
            </table>
            <p>Por favor, gestione el cobro correspondiente.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">EIP & Associates CRM</p>
          </div>
        `
        const result = await this.notificationService.sendEmail(adminEmail, subject, bodyHtml)
        success = result.success
        errorMessage = result.error
      } else if (channel === 'whatsapp') {
        const statusMsg = daysRemaining <= 0 ? `VENCIDO hace ${Math.abs(daysRemaining)} días` : `vence en ${daysRemaining} días`
        const body = `🔔 *RECORDATORIO MANUAL: TASA ANUAL*\n\nLa sociedad *${societyName}* (RUC: ${ruc}) ${statusMsg} (Fecha límite: ${format(dueDate, 'dd/MM/yyyy')}).\n\n_EIP & Associates CRM_`
        const result = await this.notificationService.sendWhatsApp(adminPhone, body)
        success = result.success
        errorMessage = result.error
      }

      // Insert log into reminder_notifications table
      await this.supabase
        .from('reminder_notifications')
        .insert({
          reminder_id: reminderId,
          channel,
          status: success ? 'sent' : 'failed',
          error_message: errorMessage || null,
          sent_at: new Date().toISOString()
        })

      if (!success) {
        return { success: false, error: errorMessage }
      }

      // Update last notification sent date
      await this.supabase
        .from('reminders')
        .update({ last_notification_sent: new Date().toISOString() })
        .eq('id', reminderId)

      return { success: true }
    } catch (err: any) {
      console.error('Error sending manual notification:', err)
      return { success: false, error: err?.message || 'Error al enviar recordatorio manual' }
    }
  }
}
