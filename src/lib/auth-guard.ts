import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'empleado' | 'cliente'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
}

/**
 * SECURITY: Verifies the current user is authenticated and optionally checks role.
 * Throws an error if the user is not authenticated or doesn't have the required role.
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthenticatedUser> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('No autorizado. Debe iniciar sesión.')
  }

  const role = (user.user_metadata?.role as UserRole) || 'empleado'

  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new Error('Acceso denegado. No tiene permisos suficientes.')
  }

  return {
    id: user.id,
    email: user.email || '',
    role,
  }
}

/**
 * SECURITY: Requires admin role.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireAuth(['admin'])
}
