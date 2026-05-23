'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Settings2, 
  History, 
  RefreshCw, 
  Calendar,
  Building,
  TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { handleRecalculateEngine, handleGetRemindersDashboard } from '@/controllers/reminder.controller'
import { RemindersTable } from './reminders-table'
import { ReminderSettingsPanel } from './reminder-settings-panel'
import { NotificationHistory } from './notification-history'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RecordatoriosDashboardClientProps {
  initialReminders: any[]
  initialSettings: any[]
  initialProviders: any[]
  initialLogs: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border border-border p-3 rounded-xl bg-card/95 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-primary font-heading">
          Cantidad: <span className="text-foreground">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function RecordatoriosDashboardClient({
  initialReminders,
  initialSettings,
  initialProviders,
  initialLogs
}: RecordatoriosDashboardClientProps) {
  const [reminders, setReminders] = useState(initialReminders)
  const [settings, setSettings] = useState(initialSettings)
  const [providers, setProviders] = useState(initialProviders)
  const [logs, setLogs] = useState(initialLogs)
  
  const [activeTab, setActiveTab] = useState<'reminders' | 'settings' | 'history'>('reminders')
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserRole(user.user_metadata?.role || 'empleado')
      }
    }
    fetchUserRole()
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders' },
        () => {
          refreshData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminder_notifications' },
        () => {
          refreshData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const refreshData = async () => {
    const result = await handleGetRemindersDashboard()
    if (result.success) {
      setReminders(result.reminders || [])
      setSettings(result.settings || [])
      setProviders(result.providers || [])
      setLogs(result.logs || [])
    }
  }

  const triggerRecalculate = async () => {
    setIsRecalculating(true)
    setFeedbackMsg(null)
    try {
      const result = await handleRecalculateEngine()
      if (result.success) {
        setFeedbackMsg({ type: 'success', text: `Motor sincronizado con éxito. Se procesaron ${result.count || 0} sociedades.` })
        await refreshData()
      } else {
        setFeedbackMsg({ type: 'error', text: result.error || 'Error al ejecutar el motor' })
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Error inesperado al conectar con el servidor.' })
    } finally {
      setIsRecalculating(false)
      setTimeout(() => setFeedbackMsg(null), 5000)
    }
  }

  // Calculate Metrics
  const totalReminders = reminders.length
  const pendingCount = reminders.filter(r => r.status === 'pending' || r.status === 'pendiente').length
  const upcomingCount = reminders.filter(r => r.status === 'upcoming' || r.status === 'próximo').length
  const overdueCount = reminders.filter(r => r.status === 'overdue' || r.status === 'vencido').length
  const paidCount = reminders.filter(r => r.status === 'paid' || r.status === 'pagado').length
  const totalAlerts = logs.filter(l => l.status === 'sent').length

  // Calculate Chart Data
  const chartData = [
    { name: 'Vencidos', valor: overdueCount },
    { name: 'Próximos', valor: upcomingCount },
    { name: 'Pendientes', valor: pendingCount },
    { name: 'Pagados', valor: paidCount }
  ]

  const kpis = [
    { title: 'Total', count: totalReminders, icon: Building, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/15' },
    { title: 'Vencidos', count: overdueCount, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/15', pulse: overdueCount > 0 },
    { title: 'Próximos', count: upcomingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15' },
    { title: 'Pendientes', count: pendingCount, icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/15' },
    { title: 'Pagados', count: paidCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/15' },
    { title: 'Alertas', count: totalAlerts, icon: Bell, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/15' }
  ]

  return (
    <div className="space-y-8 font-sans text-foreground/90">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Control de Tasas Anuales
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-semibold">
            Gestión inteligente y alertas automatizadas por Email (SMTP) y WhatsApp (Twilio API) para el cobro de sociedades.
          </p>
        </div>

        <button
          onClick={triggerRecalculate}
          disabled={isRecalculating}
          className="glass-button-primary h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 shrink-0 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>Sincronizar Motor</span>
        </button>
      </div>

      {/* Alert Feedbacks */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border font-semibold ${
              feedbackMsg.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm">{feedbackMsg.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`relative p-5 rounded-2xl border bg-black/25 glass-panel glass-card-hover flex flex-col justify-between overflow-hidden shadow-xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            {kpi.pulse && (
              <span className="absolute top-4 right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{kpi.title}</span>
              <div className={`p-1.5 rounded-lg border ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-5">
              <span className="text-3xl font-bold text-foreground font-heading tracking-tight">{kpi.count}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main split section: Table & Stats Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Navigation Tabs & Tab Panels */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Custom Sleek Tabs */}
          <div className="flex bg-card/40 border border-border p-1 rounded-xl w-fit backdrop-blur-md shadow-inner">
            {[
              { id: 'reminders', label: 'Sociedades', icon: Building },
              { id: 'settings', label: 'Configuración', icon: Settings2 },
              { id: 'history', label: 'Historial', icon: History }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-foreground bg-black/5 dark:bg-white/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Render Tab Contents */}
          <div className="glass-panel border border-white/5 bg-black/25 p-6 rounded-2xl relative overflow-hidden shadow-xl min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            {activeTab === 'reminders' && (
              <RemindersTable 
                reminders={reminders} 
                onRefresh={refreshData} 
              />
            )}
            {activeTab === 'settings' && (
              <ReminderSettingsPanel 
                initialSettings={settings} 
                initialProviders={providers} 
                onRefresh={refreshData} 
                userRole={userRole}
              />
            )}
            {activeTab === 'history' && (
              <NotificationHistory 
                logs={logs} 
                onRefresh={refreshData} 
              />
            )}
          </div>

        </div>

        {/* Right Side: Recharts Status Bar Distribution (Visual WOW factor) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel border border-white/5 bg-black/25 p-5 rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between h-full min-h-[350px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground font-heading">Distribución de Urgencia</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">
                Visualización en tiempo real del estado de recordatorios.
              </p>
            </div>

            <div className="flex-1 mt-6 h-60 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: '600' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'var(--accent)' }} content={<CustomTooltip />} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    <Cell fill="#f43f5e" />
                    <Cell fill="#fb923c" />
                    <Cell fill="#38bdf8" />
                    <Cell fill="#34d399" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="border-t border-white/5 pt-4 text-center">
              <span className="text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase">
                Hot Reload Realtime Sincronizado
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
