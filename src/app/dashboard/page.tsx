import { handleGetDashboardData } from '@/controllers/dashboard.controller'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { RemindersTable } from '@/components/dashboard/reminders-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const result = await handleGetDashboardData()

  if (!result.success) {
    return (
      <div className="p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl font-semibold">
        Error al cargar el dashboard: {result.error}
      </div>
    )
  }

  const { metrics, chartData, reminders } = result.data!

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Dashboard Ejecutivo
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-semibold">
            Control integral de sociedades y recordatorios de tasas anuales.
          </p>
        </div>
      </div>

      {/* Métricas */}
      <MetricsCards metrics={metrics} />

      {/* Gráficos */}
      <AnalyticsCharts data={chartData} />

      {/* Panel de Cobros */}
      <Card className="glass-panel border border-white/5 bg-black/25 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <CardHeader className="p-6">
          <CardTitle className="text-lg font-bold tracking-tight text-foreground font-heading">
            Próximos Cobros de Tasa Anual
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-semibold">
            Sociedades próximas a vencer o vencidas en los siguientes periodos.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <RemindersTable data={reminders} />
        </CardContent>
      </Card>
    </div>
  )
}
