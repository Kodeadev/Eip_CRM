'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Mail, 
  MessageSquare, 
  Check, 
  AlertTriangle,
  Lock,
  Globe,
  Plus,
  Trash2
} from 'lucide-react'
import { handleUpdateReminderSettings, handleToggleProviderStatus } from '@/controllers/reminder.controller'

interface ReminderSettingsPanelProps {
  initialSettings: any[]
  initialProviders: any[]
  onRefresh: () => Promise<void>
  userRole?: string | null
}

export function ReminderSettingsPanel({
  initialSettings,
  initialProviders,
  onRefresh,
  userRole
}: ReminderSettingsPanelProps) {
  const [settings, setSettings] = useState<any[]>(initialSettings)
  const [providers, setProviders] = useState<any[]>(initialProviders)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    setProviders(initialProviders)
  }, [initialProviders])

  const handleToggleProvider = async (id: string, isActive: boolean) => {
    // Update local state first for instant UI response
    setProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: isActive } : p))
    try {
      const result = await handleToggleProviderStatus(id, isActive)
      if (result.success) {
        onRefresh() // Refresh the parent dashboard client data
      } else {
        setFeedback({ type: 'error', text: result.error || 'Error al actualizar proveedor.' })
        // Revert local state on error
        setProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: !isActive } : p))
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Error de red al actualizar proveedor.' })
      setProviders(prev => prev.map(p => p.id === id ? { ...p, is_active: !isActive } : p))
    }
  }

  const handleRuleChange = (id: string, field: string, value: any) => {
    setSettings(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleChannelToggle = (id: string, channel: 'email' | 'whatsapp') => {
    setSettings(prev => prev.map(item => {
      if (item.id === id) {
        const currentChannels = item.channels || []
        const newChannels = currentChannels.includes(channel)
          ? currentChannels.filter((c: string) => c !== channel)
          : [...currentChannels, channel]
        return { ...item, channels: newChannels }
      }
      return item
    }))
  }

  const saveSettings = async () => {
    setIsSaving(true)
    setFeedback(null)
    try {
      const result = await handleUpdateReminderSettings(settings)
      if (result.success) {
        setFeedback({ type: 'success', text: 'Configuraciones de alertas guardadas y sincronizadas.' })
        onRefresh()
      } else {
        setFeedback({ type: 'error', text: result.error || 'Error al guardar cambios.' })
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Error inesperado de red.' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* 1. Thresholds rules config */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Reglas de Vencimiento</h3>
            <p className="text-xs text-muted-foreground">Configura cuándo avisar al administrador antes del cobro anual.</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50 transition duration-150 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Guardar Reglas</span>
          </button>
        </div>

        {feedback && (
          <div className={`p-3 rounded-lg text-xs font-semibold border ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
          }`}>
            {feedback.text}
          </div>
        )}

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full min-w-[750px] text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-xs font-bold text-foreground uppercase">
              <tr>
                <th className="px-5 py-3">Días de Anticipo</th>
                <th className="px-5 py-3">Prioridad Asignada</th>
                <th className="px-5 py-3">Canales Activos</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card/25">
              {settings.map((rule) => (
                <tr key={rule.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  {/* Days before */}
                  <td className="px-5 py-3 font-semibold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={rule.days_before}
                        onChange={(e) => handleRuleChange(rule.id, 'days_before', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center font-bold border border-border bg-card rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-muted-foreground">días antes</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-3">
                    <select
                      value={rule.auto_priority}
                      onChange={(e) => handleRuleChange(rule.id, 'auto_priority', e.target.value)}
                      className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-semibold bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="low">Baja (Verde)</option>
                      <option value="medium">Media (Azul)</option>
                      <option value="high">Alta (Naranja)</option>
                      <option value="critical">Crítica (Rojo)</option>
                    </select>
                  </td>

                  {/* Channels */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-4">
                      {/* Email Checkbox */}
                      <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.channels?.includes('email')}
                          onChange={() => handleChannelToggle(rule.id, 'email')}
                          className="h-3.5 w-3.5 border border-border bg-card rounded text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email</span>
                        </div>
                      </label>

                      {/* WhatsApp Checkbox */}
                      <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.channels?.includes('whatsapp')}
                          onChange={() => handleChannelToggle(rule.id, 'whatsapp')}
                          className="h-3.5 w-3.5 border border-border bg-card rounded text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </div>
                      </label>
                    </div>
                  </td>

                  {/* Active Toggle */}
                  <td className="px-5 py-3">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rule.is_active}
                        onChange={(e) => handleRuleChange(rule.id, 'is_active', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-2 text-xs font-semibold text-muted-foreground">
                        {rule.is_active ? 'Activa' : 'Pausada'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  )
}
