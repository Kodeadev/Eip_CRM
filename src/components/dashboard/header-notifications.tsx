'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, AlertCircle, Calendar, Trash2, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  title: string
  description: string
  due_date: string
  status: 'pending' | 'upcoming' | 'overdue' | 'paid' | 'cancelled' | 'pendiente' | 'próximo' | 'vencido' | 'pagado' | 'cancelado'
  priority: 'low' | 'medium' | 'high' | 'critical' | 'baja' | 'media' | 'alta' | 'urgente'
  created_at: string
  society_id: string
}

export function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isBouncing, setIsBouncing] = useState(false)
  const [timeStrings, setTimeStrings] = useState<Record<string, string>>({})
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Helper to calculate relative time in Spanish
  const getRelativeTime = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    
    if (diffMs < 0) return 'hace 1 s'
    
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return `hace ${diffSec} s`
    
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `hace ${diffMin} min`
    
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `hace ${diffHour} h`
    
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 30) return `hace ${diffDay} d`
    
    const diffMonth = Math.floor(diffDay / 30)
    return `hace ${diffMonth} m`
  }

  // Fetch active notifications/reminders
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title, description, due_date, status, priority, created_at, society_id')
        .in('status', ['pending', 'upcoming', 'overdue', 'pendiente', 'próximo', 'vencido'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (data) {
        setNotifications(data as NotificationItem[])
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  // Update elapsed relative time strings for notifications
  useEffect(() => {
    const updates: Record<string, string> = {}
    notifications.forEach((item) => {
      updates[item.id] = getRelativeTime(item.created_at)
    })
    setTimeStrings(updates)
  }, [notifications])

  // Tick interval to update timings dynamically every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const updates: Record<string, string> = {}
      notifications.forEach((item) => {
        updates[item.id] = getRelativeTime(item.created_at)
      })
      setTimeStrings(updates)
    }, 10000)

    return () => clearInterval(interval)
  }, [notifications])

  // Initial fetch and Realtime subscription
  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('header-notifications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders' },
        (payload) => {
          fetchNotifications()
          
          // Trigger shake/bounce animation when a notification is inserted
          if (payload.eventType === 'INSERT') {
            setIsBouncing(true)
            setTimeout(() => setIsBouncing(false), 800)
          }
        }
      )
      .subscribe()

    // Handle clicks outside the dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Simulate pushing a new notification
  const handleSimulateNotification = async () => {
    try {
      console.log('Iniciando simulación de notificación...')
      
      // 1. Create a temporary mock society to bypass FK constraints
      const mockSocietyName = `Sociedad de Prueba ${Math.floor(Math.random() * 1000)}`
      const mockRuc = `SIM-${Math.floor(Math.random() * 10000000)}`
      
      const { data: newSociety, error: socError } = await supabase
        .from('societies')
        .insert({
          name: mockSocietyName,
          ruc: mockRuc,
          status: 'activa',
          observations: 'Sociedad creada automáticamente para simulación de notificaciones.'
        })
        .select()
        .single()

      if (socError) throw socError

      if (newSociety) {
        // 2. Insert mock reminder linked to mock society
        const titles = [
          'Alerta de Tasa Anual Próxima',
          'Vencimiento de Registro RUC',
          'Tasa de Agente Residente pendiente',
          'Renovación Anual Requerida'
        ]
        const selectedTitle = titles[Math.floor(Math.random() * titles.length)]
        
        const { error: remError } = await supabase
          .from('reminders')
          .insert({
            society_id: newSociety.id,
            title: selectedTitle,
            description: `La tasa anual para la sociedad recién creada "${mockSocietyName}" requiere atención inmediata.`,
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
            status: 'pending',
            priority: 'critical'
          })

        if (remError) throw remError
      }
    } catch (err) {
      console.error('Error al simular la notificación:', err)
    }
  }

  // Dismiss / Delete dynamic notification
  const handleDismissNotification = async (item: NotificationItem) => {
    try {
      // 1. Delete reminder
      const { error: remError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', item.id)

      if (remError) throw remError

      // 2. Delete linked mock society if it was a simulated one
      if (item.description.includes('Sociedad creada automáticamente')) {
        await supabase
          .from('societies')
          .delete()
          .eq('id', item.society_id)
      }
      
      setNotifications(prev => prev.filter(n => n.id !== item.id))
    } catch (err) {
      console.error('Error al descartar la notificación:', err)
    }
  }

  // Dismiss all notifications
  const handleClearAll = async () => {
    try {
      // Process sequential deletion of notifications and their societies if simulated
      for (const item of notifications) {
        await handleDismissNotification(item)
      }
      setNotifications([])
    } catch (err) {
      console.error('Error al borrar todas las notificaciones:', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Floating Bell Trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={isBouncing ? {
          rotate: [0, -15, 12, -10, 8, -4, 0],
          scale: [1, 1.15, 1.15, 1, 1]
        } : {}}
        transition={{ duration: 0.6 }}
        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border/40 transition duration-200 cursor-pointer relative flex items-center justify-center"
      >
        <Bell className="h-4 w-4" />
        
        {/* Dynamic Glowing Notification Dot */}
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(197,168,128,0.7)]" />
        )}
      </motion.button>

      {/* Glassmorphic Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <span className="font-heading text-xs font-bold text-foreground uppercase tracking-widest">
                  Notificaciones
                </span>
                {notifications.length > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-3xs font-extrabold bg-primary/20 text-primary border border-primary/20">
                    {notifications.length}
                  </span>
                )}
              </div>
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-3xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition duration-150 cursor-pointer"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* List Content */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-heading">
                    Estás al día
                  </h4>
                  <p className="text-3xs text-muted-foreground mt-1 max-w-[200px]">
                    No tienes alertas de tasas pendientes en este momento.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex gap-3 hover:bg-white/5 dark:hover:bg-white/5 transition duration-150 relative group"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                      item.priority === 'urgente' || item.priority === 'alta' || item.priority === 'critical' || item.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-primary/10 border-primary/20 text-primary'
                    )}>
                      {item.priority === 'urgente' || item.priority === 'alta' || item.priority === 'critical' || item.priority === 'high' ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-foreground truncate pr-4">
                          {item.title}
                        </h4>
                        
                        {/* Relative timing clock */}
                        <span className="text-3xs text-muted-foreground whitespace-nowrap bg-muted/40 border border-border/35 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                          {timeStrings[item.id] || 'hace un momento'}
                        </span>
                      </div>
                      
                      <p className="text-3xs text-muted-foreground leading-normal line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Quick Dismiss Hover Button */}
                    <button
                      onClick={() => handleDismissNotification(item)}
                      className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition duration-200 cursor-pointer"
                      title="Descartar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Simulation Footer Control */}
            <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-center">
              <button
                onClick={handleSimulateNotification}
                className="w-full flex items-center justify-center gap-1.5 h-8 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 text-primary font-bold text-3xs uppercase tracking-widest active:scale-98 transition duration-150 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Simular Alerta Push</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
