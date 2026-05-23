import { createClient } from '@/lib/supabase/server'
import { SocietyService } from '@/services/society.service'
import { SocietiesTable } from '@/components/societies/societies-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default async function SociedadesPage() {
  const supabase = await createClient()
  const societyService = new SocietyService(supabase)
  
  let societies = []
  try {
    societies = await societyService.listSocieties()
  } catch (error) {
    console.error('Error al listar sociedades:', error)
  }

  const activeCount = societies.filter((s: any) => s.status === 'activa' || s.status === 'active').length
  const pendingCount = societies.filter((s: any) => s.status === 'en trámite' || s.status === 'pending').length
  const suspendedCount = societies.filter((s: any) => s.status === 'suspendida' || s.status === 'suspended').length

  const stats = [
    { label: "Total Sociedades", value: societies.length, color: "text-blue-400" },
    { label: "Activas", value: activeCount, color: "text-emerald-400" },
    { label: "En Trámite", value: pendingCount, color: "text-amber-400" },
    { label: "Suspendidas", value: suspendedCount, color: "text-rose-400" },
  ]

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Sociedades Anónimas
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-semibold">
            Monitoreo y administración legal de sociedades y tasas de constitución.
          </p>
        </div>
        <Link
          href="/dashboard/sociedades/nuevo"
          className={cn(
            buttonVariants({ variant: 'default' }),
            "glass-button-primary h-11 px-5 flex items-center gap-2 rounded-xl text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all duration-200"
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Nueva Sociedad</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <SocietiesTable data={societies} />
      </div>
    </div>
  )
}
