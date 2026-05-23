import { userService } from '@/services/user.service'
import { notFound, redirect } from 'next/navigation'
import { EditUserForm } from '@/components/users/edit-user-form'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser || currentUser.user_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { id } = await params
  
  let user = null
  try {
    user = await userService.getUser(id)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
  }

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/usuarios" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Usuario</h1>
          <p className="text-muted-foreground">Actualiza los datos y permisos del usuario.</p>
        </div>
      </div>

      <EditUserForm initialData={user} id={id} />
    </div>
  )
}
