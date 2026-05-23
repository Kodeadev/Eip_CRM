import { userService } from '@/services/user.service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DeleteUserButton } from '@/components/users/delete-user-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser || currentUser.user_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  const users = await userService.listUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Gestión de Usuarios</h1>
          <p className="text-xs text-muted-foreground">Administra las credenciales corporativas, roles y permisos dentro del ecosistema.</p>
        </div>
        <Link
          href="/dashboard/usuarios/nuevo"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Nuevo Usuario</span>
        </Link>
      </div>

      <div className="glass-panel border border-border bg-card/45 shadow-sm rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 font-heading text-xs font-bold text-foreground uppercase tracking-wider">Nombre</TableHead>
              <TableHead className="px-6 py-4 font-heading text-xs font-bold text-foreground uppercase tracking-wider">Correo</TableHead>
              <TableHead className="px-6 py-4 font-heading text-xs font-bold text-foreground uppercase tracking-wider">Rol</TableHead>
              <TableHead className="px-6 py-4 font-heading text-xs font-bold text-foreground uppercase tracking-wider text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  No hay usuarios registrados o la tabla 'profiles' no existe en la base de datos.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id} className="border-b border-border/40 hover:bg-black/5 dark:hover:bg-white/5 transition duration-150">
                  <TableCell className="px-6 py-4 font-semibold text-foreground">{user.name}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground font-medium">{user.email}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider border ${
                      user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      user.role === 'empleado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/dashboard/usuarios/${user.id}/editar`} 
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' }),
                          "h-8 px-3 rounded-lg border border-border text-2xs font-bold uppercase tracking-wider hover:bg-muted text-foreground transition-all active:scale-95 cursor-pointer"
                        )}
                      >
                        Editar
                      </Link>
                      <DeleteUserButton userId={user.id} userName={user.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
