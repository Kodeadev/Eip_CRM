'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, UserInput } from '@/validators/user'
import { handleCreateUser } from '@/controllers/user.controller'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useCatalogs } from '@/hooks/use-catalogs'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function NuevoUsuarioPage() {
  const { userRoles } = useCatalogs()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.role !== 'admin') {
        router.replace('/dashboard')
      } else {
        setCheckingRole(false)
      }
    }
    checkRole()
  }, [router])

  const { register, handleSubmit, control, formState: { errors } } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'empleado',
    }
  })

  const onSubmit = async (data: UserInput) => {
    setLoading(true)
    setError(null)
    const result = await handleCreateUser(data)
    if (result.success) {
      router.push('/dashboard/usuarios')
      router.refresh()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  if (checkingRole) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/usuarios" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Usuario</h1>
          <p className="text-muted-foreground">Crea un nuevo usuario en el sistema.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Usuario</CardTitle>
          <CardDescription>Completa la información para registrar al usuario.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                placeholder="Ej. Juan Pérez"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.name} value={role.name}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/usuarios" className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}>
              Cancelar
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
