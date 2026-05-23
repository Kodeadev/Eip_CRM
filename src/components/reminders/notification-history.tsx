'use client'

import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Mail, 
  MessageSquare,
  History,
  AlertCircle
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface NotificationHistoryProps {
  logs: any[]
  onRefresh: () => Promise<void>
}

export function NotificationHistory({ logs, onRefresh }: NotificationHistoryProps) {
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Bitácora e Historial de Envíos</h3>
          <p className="text-xs text-slate-500">
            Registro cronológico detallado de todas las notificaciones administrativas despachadas por el sistema.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Mostrando los últimos 50 eventos
        </span>
      </div>

      {/* Log list */}
      <div className="overflow-hidden border border-slate-100 rounded-xl bg-white">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-bold text-slate-700 uppercase">
            <tr>
              <th className="px-5 py-3">Fecha y Hora</th>
              <th className="px-5 py-3">Sociedad y Recordatorio</th>
              <th className="px-5 py-3">Canal</th>
              <th className="px-5 py-3">Resultado</th>
              <th className="px-5 py-3">Detalle / Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="h-8 w-8 text-slate-300" />
                    <span className="text-sm font-semibold">No hay notificaciones registradas</span>
                    <span className="text-xs">Los envíos automáticos o manuales aparecerán aquí una vez gatillados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isSent = log.status === 'sent'
                const isEmail = log.channel === 'email'
                const isWhatsapp = log.channel === 'whatsapp'

                return (
                  <tr key={log.id} className="hover:bg-slate-50/20">
                    {/* Timestamp */}
                    <td className="px-5 py-4 font-medium text-slate-500 whitespace-nowrap">
                      {format(parseISO(log.sent_at), 'dd/MM/yyyy HH:mm:ss')}
                    </td>

                    {/* Society & Title */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {log.reminders?.title || 'Recordatorio Administrativo'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Log ID: {log.id}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="px-5 py-4">
                      {isEmail ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </span>
                      )}
                    </td>

                    {/* Status Result */}
                    <td className="px-5 py-4">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          Exitoso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-100">
                          <XCircle className="h-3.5 w-3.5 text-rose-500" />
                          Fallido
                        </span>
                      )}
                    </td>

                    {/* Details / Error Messages */}
                    <td className="px-5 py-4 text-xs font-medium max-w-xs">
                      {isSent ? (
                        <span className="text-slate-400">Entregado con éxito a credenciales</span>
                      ) : (
                        <div className="flex items-start gap-1.5 text-rose-600 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{log.error_message || 'Fallo de entrega en gateway'}</span>
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
