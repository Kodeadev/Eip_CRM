import { SupabaseClient } from '@supabase/supabase-js'

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async login(data: { email: string; password: string }) {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) throw error
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }
}
