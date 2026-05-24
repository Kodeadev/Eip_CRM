import { handleGetRemindersDashboard } from '@/controllers/reminder.controller'
import { RecordatoriosDashboardClient } from '@/components/reminders/recordatorios-dashboard-client'

export const dynamic = 'force-dynamic'

export default async function RecordatoriosPage() {
  const result = await handleGetRemindersDashboard()
  
  if (!result.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold">Error al cargar recordatorios</h2>
          <p>{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <RecordatoriosDashboardClient 
        initialReminders={result.reminders || []} 
        initialSettings={result.settings || []}
        initialProviders={result.providers || []}
        initialLogs={result.logs || []}
      />
    </div>
  )
}
