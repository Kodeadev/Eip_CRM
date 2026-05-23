'use server'

import { userService } from '@/services/user.service'
import { UserInput } from '@/validators/user'
import { revalidatePath } from 'next/cache'

export async function handleCreateUser(data: UserInput) {
  try {
    await userService.createUser(data)
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear usuario' }
  }
}

export async function handleListUsers() {
  try {
    const users = await userService.listUsers()
    return { success: true, data: users }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al listar usuarios' }
  }
}

export async function handleUpdateUser(id: string, data: any) {
  try {
    console.log('handleUpdateUser started for id:', id);
    const user = await userService.updateUser(id, data)
    console.log('handleUpdateUser success:', user);
    revalidatePath('/dashboard/usuarios')
    return { success: true, data: user }
  } catch (error: any) {
    console.error('handleUpdateUser error:', error);
    return { success: false, error: error.message || 'Error al actualizar usuario' }
  }
}

export async function handleDeleteUser(id: string) {
  try {
    await userService.deleteUser(id)
    revalidatePath('/dashboard/usuarios')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar usuario' }
  }
}
