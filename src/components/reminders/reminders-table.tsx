'use client'

import { useState } from 'react'
import { 
  Search, 
  Mail, 
  MessageSquare, 
  Check, 
  AlertTriangle,
  Building,
  MoreVertical,
  ChevronDown
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { handleSendManualReminder, handleMarkAsPaid } from '@/controllers/reminder.controller'

interface RemindersTableProps {
  reminders: any[]
  onRefresh: () => Promise<void>
}

export function RemindersTable({ reminders, onRefresh }: RemindersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'próximo' | 'vencido' | 'pagado'>('todos')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ id: string, type: 'success' | 'error', text: string } | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // Filters logic
  const filteredReminders = reminders.filter(r => {
    const society = r.societies || {}
    const societyName = (society.name || '').toLowerCase()
    const ruc = (society.ruc || '').toLowerCase()
    const searchMatch = societyName.includes(searchTerm.toLowerCase()) || ruc.includes(searchTerm.toLowerCase())
    
    let statusMatch = false
    if (statusFilter === 'todos') {
      statusMatch = true
    } else if (statusFilter === 'pendiente') {
      statusMatch = r.status === 'pending' || r.status === 'pendiente'
    } else if (statusFilter === 'próximo') {
      statusMatch = r.status === 'upcoming' || r.status === 'próximo'
    } else if (statusFilter === 'vencido') {
      statusMatch = r.status === 'overdue' || r.status === 'vencido'
    } else if (statusFilter === 'pagado') {
      statusMatch = r.status === 'paid' || r.status === 'pagado'
    }
    
    return searchMatch && statusMatch
  })

  const sendNotification = async (reminderId: string, channel: 'email' | 'whatsapp') => {
    setProcessingId(`${reminderId}-${channel}`)
    setActionFeedback(null)
    setOpenDropdownId(null)
    try {
      const result = await handleSendManualReminder(reminderId, channel)
      if (result.success) {
        setActionFeedback({
          id: reminderId,
          type: 'success',
          text: `Recordatorio enviado vía ${channel === 'email' ? 'Correo' : 'WhatsApp'} con éxito.`
        })
        onRefresh()
      } else {
        setActionFeedback({
          id: reminderId,
          type: 'error',
          text: result.error || 'Error al enviar recordatorio.'
        })
      }
    } catch (e) {
      setActionFeedback({
        id: reminderId,
        type: 'error',
        text: 'Error de red al despachar recordatorio.'
      })
    } finally {
      setProcessingId(null)
      setTimeout(() => setActionFeedback(null), 5000)
    }
  }

  const markPaid = async (reminderId: string) => {
    setProcessingId(`${reminderId}-paid`)
    setActionFeedback(null)
    setOpenDropdownId(null)
    try {
      const result = await handleMarkAsPaid(reminderId)
      if (result.success) {
        setActionFeedback({
          id: reminderId,
          type: 'success',
          text: 'Tasa marcada como Pagada. Se actualizó la fecha al próximo año.'
        })
        onRefresh()
      } else {
        setActionFeedback({
          id: reminderId,
          type: 'error',
          text: result.error || 'Error al registrar pago.'
        })
      }
    } catch (e) {
      setActionFeedback({
        id: reminderId,
        type: 'error',
        text: 'Error al registrar pago.'
      })
    } finally {
      setProcessingId(null)
      setTimeout(() => setActionFeedback(null), 5000)
    }
  }

  // Helper for priority badges
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'urgente':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-100 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Crítica
          </span>
        )
      case 'high':
      case 'alta':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-100">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Alta
          </span>
        )
      case 'medium':
      case 'media':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Media
          </span>
        )
      case 'low':
      case 'baja':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Baja
          </span>
        )
    }
  }

  // Helper for status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
      case 'vencido':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-2xs font-extrabold text-rose-800 uppercase tracking-wider">
            Vencido
          </span>
        )
      case 'upcoming':
      case 'próximo':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-2xs font-extrabold text-orange-800 uppercase tracking-wider">
            Próximo
          </span>
        )
      case 'pending':
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-2xs font-extrabold text-blue-800 uppercase tracking-wider">
            Pendiente
          </span>
        )
      case 'paid':
      case 'pagado':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-2xs font-extrabold text-emerald-800 uppercase tracking-wider">
            Pagado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-extrabold text-slate-800 uppercase tracking-wider">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-4 p-5">
      {/* Search & Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar sociedad por nombre o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 self-start md:self-auto overflow-x-auto w-full md:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'vencido', label: 'Vencidos' },
            { id: 'próximo', label: 'Próximos' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'pagado', label: 'Pagados' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer whitespace-nowrap ${
                statusFilter === filter.id
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full border-collapse text-left text-sm text-slate-500">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100">
            <tr>
              <th scope="col" className="px-6 py-4">Sociedad / RUC</th>
              <th scope="col" className="px-6 py-4">Fecha de Vence</th>
              <th scope="col" className="px-6 py-4">Estado</th>
              <th scope="col" className="px-6 py-4">Prioridad</th>
              <th scope="col" className="px-6 py-4">Última Alerta</th>
              <th scope="col" className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {filteredReminders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Building className="h-8 w-8 text-slate-300 animate-pulse" />
                    <span className="text-sm font-semibold">No se encontraron recordatorios</span>
                    <span className="text-xs">Prueba ajustando los filtros o buscando otro término.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredReminders.map((reminder) => {
                const society = reminder.societies || {}
                const isProcessing = processingId?.startsWith(reminder.id)
                const hasFeedback = actionFeedback?.id === reminder.id

                return (
                  <tr key={reminder.id} className="hover:bg-slate-50/50 transition">
                    {/* Society Name & RUC */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-950">{society.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">RUC: {society.ruc || 'N/A'}</div>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">
                        {format(parseISO(reminder.due_date), 'dd/MM/yyyy')}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {renderStatusBadge(reminder.status)}
                    </td>

                    {/* Priority Badge */}
                    <td className="px-6 py-4">
                      {renderPriorityBadge(reminder.priority)}
                    </td>

                    {/* Last Notification Sent */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 font-medium">
                        {reminder.last_notification_sent ? (
                          format(parseISO(reminder.last_notification_sent), 'dd/MM/yyyy HH:mm')
                        ) : (
                          <span className="text-slate-400">Nunca</span>
                        )}
                      </div>
                    </td>

                    {/* Actions dropdown/buttons */}
                    <td className="px-6 py-4 text-right relative">
                      {hasFeedback ? (
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg ${
                          actionFeedback!.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {actionFeedback!.text}
                        </span>
                      ) : (
                        <div className="flex justify-end items-center gap-1.5">
                          {/* Email SMTP action */}
                          <button
                            onClick={() => sendNotification(reminder.id, 'email')}
                            disabled={isProcessing}
                            title="Enviar Correo Informativo"
                            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Mail className="h-4 w-4" />
                          </button>

                          {/* WhatsApp Twilio action */}
                          <button
                            onClick={() => sendNotification(reminder.id, 'whatsapp')}
                            disabled={isProcessing}
                            title="Enviar WhatsApp de Cobro"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          {/* Quick paid marker */}
                          {reminder.status !== 'pagado' && (
                            <button
                              onClick={() => markPaid(reminder.id)}
                              disabled={isProcessing}
                              title="Marcar como Pagado"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
