import { handleListPayments } from '@/controllers/payment.controller'
import { PaymentsTable } from '@/components/payments/payments-table'
import Link from 'next/link'
import { Plus, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface SearchParams {
  filter?: string
}

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const activeFilter = params?.filter

  const result = await handleListPayments(activeFilter)
  const payments = result.data || []

  // Calcular estadísticas básicas
  const totalPagos = payments.length
  const totalMonto = payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0)
  
  // Próximos vencimientos (en los próximos 30 días)
  const today = new Date()
  const in30Days = new Date()
  in30Days.setDate(today.getDate() + 30)
  
  const proximosVencimientos = payments.filter((p: any) => {
    const nextDate = new Date(p.next_due_date)
    return nextDate > today && nextDate <= in30Days
  }).length

  const vencidos = payments.filter((p: any) => new Date(p.next_due_date) < today).length

  const stats = [
    { label: "Total Registros", value: totalPagos, color: "text-blue-400" },
    { label: "Monto Recaudado", value: `$${totalMonto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-emerald-400" },
    { label: "Próximos (30 días)", value: proximosVencimientos, color: "text-amber-400" },
    { label: "Vencidos", value: vencidos, color: "text-rose-400" },
  ]

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary shrink-0 animate-pulse" />
            <span>Cobros de Tasas Anuales</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-semibold">
            Historial de cobros financieros, tasas anuales y control de fechas de expiración.
          </p>
        </div>
        <Link
          href="/dashboard/pagos/nuevo"
          className={cn(
            buttonVariants({ variant: 'default' }),
            "glass-button-primary h-11 px-5 flex items-center gap-2 rounded-xl text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all duration-200"
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Registrar Cobro</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="glass-panel glass-card-hover border border-white/5 bg-black/25 p-5 rounded-2xl relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 font-heading tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel border border-white/5 bg-black/25 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <PaymentsTable data={payments || []} activeFilter={activeFilter} />
      </div>
    </div>
  )
}
