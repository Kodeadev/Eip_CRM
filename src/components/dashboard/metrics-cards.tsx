import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, CheckCircle, Clock, AlertTriangle, CreditCard, Calendar } from "lucide-react"

export function MetricsCards({ metrics }: { metrics: any }) {
  const cards = [
    {
      title: "Total Sociedades",
      value: metrics.total,
      icon: Building,
      description: "Sociedades registradas",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      glow: "shadow-blue-500/5",
    },
    {
      title: "Activas",
      value: metrics.active,
      icon: CheckCircle,
      description: "Operando normalmente",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      glow: "shadow-emerald-500/5",
    },
    {
      title: "En Trámite",
      value: metrics.pending,
      icon: Clock,
      description: "En proceso de registro",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      glow: "shadow-amber-500/5",
    },
    {
      title: "Suspendidas",
      value: metrics.suspended,
      icon: AlertTriangle,
      description: "Temporalmente inactivas",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      glow: "shadow-red-500/5",
    },
    {
      title: "Cobros Próximos",
      value: metrics.pendingReminders,
      icon: Calendar,
      description: "Vencimientos cercanos",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      glow: "shadow-indigo-500/5",
    },
    {
      title: "Cobros Vencidos",
      value: metrics.overdueReminders,
      icon: CreditCard,
      description: "Pagos atrasados",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      glow: "shadow-rose-500/5",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="glass-panel glass-card-hover border border-white/5 relative overflow-hidden bg-black/25 rounded-2xl shadow-xl transition-all duration-300"
        >
          {/* Card light reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-xl border ${card.bg} shadow-lg ${card.glow} flex items-center justify-center shrink-0`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold tracking-tight text-foreground font-heading">
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground/80 mt-1 font-semibold">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
