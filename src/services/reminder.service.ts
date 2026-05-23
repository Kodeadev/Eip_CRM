import { SupabaseClient } from '@supabase/supabase-js'
import { ReminderInput } from '@/validators/reminder'

export class ReminderService {
  constructor(private supabase: SupabaseClient) {}

  async listReminders() {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*, societies(name, ruc)')
      .order('due_date', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getReminder(id: string) {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*, societies(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getReminderBySociety(societyId: string, type: string = 'tasa_anual') {
    const { data, error } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('society_id', societyId)
      .eq('reminder_type', type)
      .maybeSingle() // Use maybeSingle to not throw if it doesn't exist
    
    if (error) throw error
    return data
  }

  async createReminder(data: ReminderInput) {
    const { data: result, error } = await this.supabase
      .from('reminders')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    
    // Log action
    await this.logAction(result.id, 'created', 'Recordatorio creado')
    
    return result
  }

  async updateReminder(id: string, data: Partial<ReminderInput>) {
    const { data: result, error } = await this.supabase
      .from('reminders')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Log action
    await this.logAction(id, 'updated', `Recordatorio actualizado: ${Object.keys(data).join(', ')}`)
    
    return result
  }

  async deleteReminder(id: string) {
    const { error } = await this.supabase
      .from('reminders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  private async logAction(reminderId: string, action: string, description: string) {
    const { error } = await this.supabase
      .from('reminder_logs')
      .insert({
        reminder_id: reminderId,
        action,
        description,
      })
    
    if (error) console.error('Error logging reminder action:', error)
  }
}
