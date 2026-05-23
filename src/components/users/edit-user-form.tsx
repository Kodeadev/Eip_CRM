'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editUserSchema, EditUserInput } from '@/validators/user'
import { handleUpdateUser } from '@/controllers/user.controller'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Controller } from 'react-hook-form'
import { useCatalogs } from '@/hooks/use-catalogs'

export function EditUserForm({ initialData, id }: { initialData: any, id: string }) {
  const { userRoles } = useCatalogs()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { register, handleSubmit, control, formState: { errors } } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      role: initialData.role || 'empleado',
      password: '', // Dejar en blanco si no se va a cambiar
    }
  })

  const onSubmit = async (data: EditUserInput) => {
    setLoading(true)
    setError(null)
    const result = await handleUpdateUser(id, data)
    if (result.success) {
      router.push('/dashboard/usuarios')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            Modifica los datos del usuario. Si no deseas cambiar la contraseña, deja el campo en blanco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" placeholder="Ej. Juan Pérez" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" placeholder="ejemplo@empresa.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña (Opcional)</Label>
            <Input id="password" type="password" placeholder="Dejar en blanco para mantener la actual" {...register('password')} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol en el Sistema</Label>
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
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/dashboard/usuarios" className={cn(buttonVariants({ variant: 'outline' }))}>
          Cancelar
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  )
}
