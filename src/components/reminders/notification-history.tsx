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
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Bitácora e Historial de Envíos</h3>
          <p className="text-xs text-muted-foreground">
            Registro cronológico detallado de todas las notificaciones administrativas despachadas por el sistema.
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground/60">
          Mostrando los últimos 50 eventos
        </span>
      </div>

      {/* Log list */}
      <div className="overflow-x-auto border border-white/5 rounded-xl bg-transparent">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-white/[0.02] border-b border-white/5 text-xs font-bold text-muted-foreground uppercase">
            <tr>
              <th className="px-5 py-3">Fecha y Hora</th>
              <th className="px-5 py-3">Sociedad y Recordatorio</th>
              <th className="px-5 py-3">Canal</th>
              <th className="px-5 py-3">Resultado</th>
              <th className="px-5 py-3">Detalle / Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="h-8 w-8 text-muted-foreground/30" />
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
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
                    {/* Timestamp */}
                    <td className="px-5 py-4 font-medium text-muted-foreground whitespace-nowrap">
                      {format(parseISO(log.sent_at), 'dd/MM/yyyy HH:mm:ss')}
                    </td>

                    {/* Society & Title */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {log.reminders?.title || 'Recordatorio Administrativo'}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                        Log ID: {log.id}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="px-5 py-4">
                      {isEmail ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </span>
                      )}
                    </td>

                    {/* Status Result */}
                    <td className="px-5 py-4">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          Exitoso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/20 animate-pulse">
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          Fallido
                        </span>
                      )}
                    </td>

                    {/* Details / Error Messages */}
                    <td className="px-5 py-4 text-xs font-medium max-w-xs">
                      {isSent ? (
                        <span className="text-muted-foreground/60">Entregado con éxito a credenciales</span>
                      ) : (
                        <div className="flex items-start gap-1.5 text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
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
