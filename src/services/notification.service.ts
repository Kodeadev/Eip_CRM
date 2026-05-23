import { SupabaseClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export interface NotificationPayload {
  societyName: string
  ruc: string
  dueDate: string
  daysRemaining: number
  recipientEmail: string
  recipientPhone: string
}

export class NotificationService {
  constructor(private supabase: SupabaseClient) {}

  async getActiveProvider(type: 'email_smtp' | 'whatsapp_twilio') {
    const { data, error } = await this.supabase
      .from('notification_providers')
      .select('*')
      .eq('provider_type', type)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching active provider ${type}:`, error)
      return null
    }
    return data
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const provider = await this.getActiveProvider('email_smtp')
      if (!provider) {
        return { success: false, error: 'No active SMTP provider found.' }
      }

      const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, sender_email } = provider.config

      const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: parseInt(smtp_port),
        secure: smtp_secure === true || smtp_port === '465',
        auth: {
          user: smtp_user,
          pass: smtp_pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      })

      const mailOptions = {
        from: `"EIP & Associates" <${sender_email || smtp_user}>`,
        to,
        subject,
        html: htmlContent,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error: any) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message || String(error) }
    }
  }

  async sendWhatsApp(to: string, body: string): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    try {
      const provider = await this.getActiveProvider('whatsapp_twilio')
      if (!provider) {
        return { success: false, error: 'No active Twilio provider found.' }
      }

      const { account_sid, auth_token, from_number } = provider.config

      if (!account_sid || !auth_token || !from_number) {
        return { success: false, error: 'Twilio configuration is incomplete.' }
      }

      // Format recipient phone number: clean spaces, plus signs, dashes
      const cleanPhone = to.replace(/[\s\+\-\(\)]/g, '')
      const formattedTo = `whatsapp:+${cleanPhone}`
      const formattedFrom = `whatsapp:${from_number.replace('whatsapp:', '')}`

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`

      const params = new URLSearchParams()
      params.append('From', formattedFrom)
      params.append('To', formattedTo)
      params.append('Body', body)

      const authHeader = 'Basic ' + Buffer.from(`${account_sid}:${auth_token}`).toString('base64')

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader,
        },
        body: params.toString(),
      })

      const resData = await response.json()

      if (!response.ok) {
        console.error('Twilio API returned error:', resData)
        return { success: false, error: resData.message || `Twilio Error Code: ${resData.code || response.status}` }
      }

      console.log('WhatsApp message sent successfully via Twilio, messageSid:', resData.sid)
      return { success: true, messageSid: resData.sid }
    } catch (error: any) {
      console.error('Failed to send WhatsApp message:', error)
      return { success: false, error: error.message || String(error) }
    }
  }
}
