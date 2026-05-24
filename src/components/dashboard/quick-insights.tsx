import { Sparkles, Calendar, CreditCard, AlertOctagon, CheckCircle2 } from "lucide-react"

export interface QuickInsightsProps {
  insights: {
    upcomingThisWeek: number
    overduePayments: number
    failedReminders: number
    paymentsThisMonth: number
  }
}

export function QuickInsights({ insights }: QuickInsightsProps) {
  const items = [
    {
      label: "Tasas por vencer",
      desc: insights.upcomingThisWeek === 0 
        ? "Sin vencimientos esta semana"
        : `${insights.upcomingThisWeek} sociedades vencen esta semana`,
      icon: Calendar,
      color: insights.upcomingThisWeek === 0 ? "text-emerald-400" : "text-amber-400",
      bg: insights.upcomingThisWeek === 0 ? "bg-emerald-500/10 border-emerald-500/25" : "bg-amber-500/10 border-amber-500/25",
    },
    {
      label: "Pagos vencidos",
      desc: insights.overduePayments === 0 
        ? "Al día con todos los cobros"
        : `${insights.overduePayments} pagos están atrasados`,
      icon: CreditCard,
      color: insights.overduePayments === 0 ? "text-emerald-400" : "text-rose-400 animate-pulse",
      bg: insights.overduePayments === 0 ? "bg-emerald-500/10 border-emerald-500/25" : "bg-rose-500/10 border-rose-500/25",
    },
    {
      label: "Alertas de recordatorios",
      desc: insights.failedReminders === 0 
        ? "Recordatorios enviados exitosamente"
        : `${insights.failedReminders} alertas reportaron error`,
      icon: AlertOctagon,
      color: insights.failedReminders === 0 ? "text-emerald-400" : "text-rose-400",
      bg: insights.failedReminders === 0 ? "bg-emerald-500/10 border-emerald-500/25" : "bg-rose-500/10 border-rose-500/25",
    },
    {
      label: "Actividad del mes",
      desc: insights.paymentsThisMonth === 0 
        ? "Sin pagos registrados aún"
        : `${insights.paymentsThisMonth} cobros registrados este mes`,
      icon: CheckCircle2,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/25",
    }
  ]

  return (
    <div className="glass-panel border border-white/5 bg-black/25 p-5 rounded-2xl relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-sans">
          Insights Operativos del Sistema
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors duration-200"
          >
            <div className={`p-2.5 rounded-xl border ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-xs text-foreground/90 font-semibold mt-0.5 leading-snug">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
