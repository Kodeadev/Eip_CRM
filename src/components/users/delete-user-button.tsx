'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { handleDeleteUser } from '@/controllers/user.controller'
import { cn } from '@/lib/utils'

interface DeleteUserButtonProps {
  userId: string
  userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción eliminará permanentemente la cuenta de la base de datos.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await handleDeleteUser(userId)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'No se pudo eliminar el usuario.')
      }
    } catch (err: any) {
      alert(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-transparent transition-all duration-200 cursor-pointer disabled:opacity-50",
        "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 active:scale-90"
      )}
      title="Eliminar usuario"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0 text-red-500" />
      ) : (
        <Trash2 className="h-4 w-4 shrink-0" />
      )}
    </button>
  )
}
