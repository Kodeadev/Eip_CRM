import { SupabaseClient } from '@supabase/supabase-js'

export class DashboardService {
  constructor(private supabase: SupabaseClient) {}

  async getMetrics() {
    const today = new Date()
    
    // 1. Obtener sociedades activas (evitando borrados lógicos)
    const { data: societies, error: e1 } = await this.supabase
      .from('societies')
      .select('id, status, next_payment_date')
      .is('deleted_at', null)
    
    if (e1) throw e1

    const total = societies.length
    const active = societies.filter(s => s.status === 'activa').length
    const pending = societies.filter(s => s.status === 'en trámite').length
    const suspended = societies.filter(s => s.status === 'suspendida').length
    const dissolved = societies.filter(s => s.status === 'disuelta').length

    // 2. Obtener recordatorios
    const { data: reminders, error: e2 } = await this.supabase
      .from('reminders')
      .select('status')
    
    if (e2) throw e2

    const pendingReminders = reminders.filter(r => r.status === 'pendiente' || r.status === 'próximo').length
    const overdueReminders = reminders.filter(r => r.status === 'vencido').length

    // 3. Obtener recordatorios o logs fallidos (para Quick Insights)
    const { data: failedLogs, error: e4 } = await this.supabase
      .from('reminder_logs')
      .select('id')
      .or('action.eq.error,action.eq.failed,description.ilike.%falló%,description.ilike.%error%')
    
    const failedCount = failedLogs?.length || 0

    // 4. Obtener pagos registrados este mes (para Quick Insights)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
    
    const { data: monthPayments, error: e5 } = await this.supabase
      .from('society_payments')
      .select('id')
      .gte('payment_date', firstDayOfMonth)
      .lte('payment_date', lastDayOfMonth)
    
    const monthlyPaymentCount = monthPayments?.length || 0

    // Fechas límites para cálculo de vencimientos de sociedades
    const todayStr = today.toISOString().split('T')[0]
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    const upcomingThisWeekCount = societies.filter(s => {
      if (!s.next_payment_date) return false
      return s.next_payment_date >= todayStr && s.next_payment_date <= nextWeekStr
    }).length

    const overduePaymentsCount = societies.filter(s => {
      if (!s.next_payment_date) return false
      return s.next_payment_date < todayStr
    }).length

    return {
      total,
      active,
      pending,
      suspended,
      dissolved,
      pendingReminders,
      overdueReminders,
      insights: {
        upcomingThisWeek: upcomingThisWeekCount,
        overduePayments: overduePaymentsCount,
        failedReminders: failedCount,
        paymentsThisMonth: monthlyPaymentCount,
      }
    }
  }

  async getChartData() {
    const today = new Date()

    // 1. Cobros Registrados por Mes (últimos 6 meses cronológicos)
    const monthsData: Record<string, { name: string; count: number; total: number; sortKey: string }> = {}
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setDate(1) // evitar overflow en fin de mes (ej. 31 de mayo)
      d.setMonth(today.getMonth() - i)
      const year = d.getFullYear()
      const monthIdx = d.getMonth()
      const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}` // yyyy-mm
      monthsData[key] = {
        name: `${monthNames[monthIdx]} ${String(year).slice(-2)}`,
        count: 0,
        total: 0,
        sortKey: key
      }
    }

    const { data: payments, error: ePay } = await this.supabase
      .from('society_payments')
      .select('payment_date, amount')
      .limit(1000)
    
    if (ePay) throw ePay

    ;(payments || []).forEach(p => {
      if (!p.payment_date) return
      const dateObj = new Date(p.payment_date)
      const year = dateObj.getFullYear()
      const monthIdx = dateObj.getMonth()
      const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`
      
      if (monthsData[key]) {
        monthsData[key].count++
        monthsData[key].total += parseFloat(p.amount) || 0
      }
    })

    const paymentsByMonth = Object.values(monthsData)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ name, count, total }) => ({
        month: name,
        cantidad: count,
        monto: total
      }))

    // 2. Estado de Cumplimiento de Sociedades
    const { data: societies, error: eSoc } = await this.supabase
      .from('societies')
      .select('next_payment_date')
      .is('deleted_at', null)
    
    if (eSoc) throw eSoc

    const todayStr = today.toISOString().split('T')[0]
    const in30Days = new Date()
    in30Days.setDate(today.getDate() + 30)
    const in30DaysStr = in30Days.toISOString().split('T')[0]

    let upToDate = 0
    let upcoming = 0
    let overdue = 0

    ;(societies || []).forEach(s => {
      if (!s.next_payment_date) {
        upToDate++
        return
      }

      if (s.next_payment_date < todayStr) {
        overdue++
      } else if (s.next_payment_date >= todayStr && s.next_payment_date <= in30DaysStr) {
        upcoming++
      } else {
        upToDate++
      }
    })

    const complianceStats = [
      { name: 'Al Día', value: upToDate },
      { name: 'Próximos a Vencer', value: upcoming },
      { name: 'Vencidos', value: overdue }
    ]

    return {
      paymentsByMonth,
      complianceStats
    }
  }
}
