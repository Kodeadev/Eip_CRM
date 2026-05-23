import { createClient } from '@/lib/supabase/server'
import { SocietyService } from '@/services/society.service'
import { notFound } from 'next/navigation'
import { EditSocietyForm } from '@/components/societies/edit-society-form'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function EditarSociedadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const societyService = new SocietyService(supabase)
  
  let society = null
  try {
    society = await societyService.getSociety(id)
  } catch (error) {
    console.error('Error al obtener sociedad:', error)
  }

  if (!society) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/sociedades/${id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Sociedad</h1>
          <p className="text-muted-foreground">Modifica los datos de la sociedad anónima.</p>
        </div>
      </div>

      <EditSocietyForm initialData={society} id={id} />
    </div>
  )
}
