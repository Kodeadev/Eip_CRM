import { SupabaseClient } from '@supabase/supabase-js'

export class DashboardService {
  constructor(private supabase: SupabaseClient) {}

  async getMetrics() {
    const { data: societies, error: e1 } = await this.supabase
      .from('societies')
      .select('status')
      .is('deleted_at', null)
    
    if (e1) throw e1

    const total = societies.length
    const active = societies.filter(s => s.status === 'activa').length
    const pending = societies.filter(s => s.status === 'en trámite').length
    const suspended = societies.filter(s => s.status === 'suspendida').length
    const dissolved = societies.filter(s => s.status === 'disuelta').length

    const { data: reminders, error: e2 } = await this.supabase
      .from('reminders')
      .select('status')
    
    if (e2) throw e2

    const pendingReminders = reminders.filter(r => r.status === 'pendiente' || r.status === 'próximo').length
    const overdueReminders = reminders.filter(r => r.status === 'vencido').length

    return {
      total,
      active,
      pending,
      suspended,
      dissolved,
      pendingReminders,
      overdueReminders,
    }
  }

  async getChartData() {
    const { data, error } = await this.supabase
      .from('societies')
      .select('status')
      .is('deleted_at', null)
    
    if (error) throw error

    const counts = {
      activa: 0,
      'en trámite': 0,
      suspendida: 0,
      disuelta: 0,
    }

    data.forEach(s => {
      if (s.status in counts) {
        counts[s.status as keyof typeof counts]++
      }
    })

    return [
      { name: 'Activas', value: counts.activa },
      { name: 'En Trámite', value: counts['en trámite'] },
      { name: 'Suspendidas', value: counts.suspendida },
      { name: 'Disueltas', value: counts.disuelta },
    ]
  }
}
