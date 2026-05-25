'use server'

import { userService } from '@/services/user.service'
import { userSchema, editUserSchema, UserInput } from '@/validators/user'
import { requireAdmin } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function handleCreateUser(rawData: unknown) {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    // SECURITY: Server-side validation
    const parsed = userSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }

    await userService.createUser(parsed.data)
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear usuario' }
  }
}

export async function handleListUsers() {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    const users = await userService.listUsers()
    return { success: true, data: users }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al listar usuarios' }
  }
}

export async function handleUpdateUser(id: string, rawData: unknown) {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    // SECURITY: Server-side validation
    const parsed = editUserSchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }

    const user = await userService.updateUser(id, parsed.data)
    revalidatePath('/dashboard/usuarios')
    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar usuario' }
  }
}

export async function handleDeleteUser(id: string) {
  try {
    // SECURITY: Admin-only operation
    await requireAdmin()

    await userService.deleteUser(id)
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar usuario' }
  }
}
