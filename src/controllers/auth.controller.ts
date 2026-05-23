import { createClient } from '@/lib/supabase/client'
import { AuthService } from '@/services/auth.service'
import { LoginInput } from '@/validators/auth'

export class AuthController {
  private authService: AuthService

  constructor() {
    const supabase = createClient()
    this.authService = new AuthService(supabase)
  }

  async handleLogin(data: LoginInput) {
    try {
      // Mapear usuario a correo electrónico
      const email = `${data.username}@eip.com`
      
      await this.authService.login({ email, password: data.password })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesión' }
    }
  }

  async handleLogout() {
    try {
      await this.authService.logout()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al cerrar sesión' }
    }
  }
}

export const authController = new AuthController()
