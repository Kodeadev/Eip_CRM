import { createClient } from '@supabase/supabase-js'
import { UserInput } from '@/validators/user'

export class UserService {
  private _supabase: any = null

  private get supabase() {
    if (!this._supabase) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for UserService')
      }
      this._supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      )
    }
    return this._supabase
  }

  async createUser(data: UserInput) {
    const { data: userData, error } = await this.supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: data.role,
      },
    })
    if (error) throw error
    return userData
  }

  async getUser(id: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(id)
    if (error) throw error
    
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || '',
      role: data.user.user_metadata?.role || 'empleado',
    }
  }

  async updateUser(id: string, data: { name?: string, email?: string, password?: string, role?: string }) {
    const updateData: any = {
      email: data.email,
      user_metadata: {
        name: data.name,
        role: data.role,
      }
    }
    
    if (data.password && data.password.length >= 6) {
      updateData.password = data.password
    }

    const { data: userData, error } = await this.supabase.auth.admin.updateUserById(id, updateData)
    if (error) throw error
    return userData
  }

  async listUsers() {
    const { data: { users }, error } = await this.supabase.auth.admin.listUsers()
    if (error) throw error
    
    return users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'Sin nombre',
      role: user.user_metadata?.role || 'sin rol',
    }))
  }

  async deleteUser(id: string) {
    // Desacoplar de forma segura las referencias de claves foráneas antes de borrar de auth.users
    try {
      await this.supabase.from('society_history').update({ user_id: null }).eq('user_id', id)
    } catch (e) {
      console.warn('Error disassociating society_history:', e)
    }

    try {
      await this.supabase.from('society_payments').update({ created_by: null }).eq('created_by', id)
    } catch (e) {
      console.warn('Error disassociating society_payments:', e)
    }

    try {
      await this.supabase.from('payment_documents').update({ created_by: null }).eq('created_by', id)
    } catch (e) {
      console.warn('Error disassociating payment_documents:', e)
    }

    const { error } = await this.supabase.auth.admin.deleteUser(id)
    if (error) throw error
    return { success: true }
  }
}

export const userService = new UserService()
