import { createClient } from '@/lib/supabase/client'
import { LEGAL_PERSON_TYPES } from '@/constants/legal-person-types'

// Hardcoded Fallbacks to ensure the system is bulletproof
export const FALLBACK_SOCIETY_STATUSES = [
  { name: 'activa', label: 'Activa' },
  { name: 'en trámite', label: 'En Trámite' },
  { name: 'suspendida', label: 'Suspendida' },
  { name: 'disuelta', label: 'Disuelta' }
]

export const FALLBACK_USER_ROLES = [
  { name: 'admin', label: 'Administrador' },
  { name: 'empleado', label: 'Empleado' },
  { name: 'cliente', label: 'Cliente' }
]

export const FALLBACK_PAYMENT_METHODS = [
  { name: 'transferencia', label: 'Transferencia Bancaria' },
  { name: 'efectivo', label: 'Efectivo' },
  { name: 'cheque', label: 'Cheque' },
  { name: 'tarjeta', label: 'Tarjeta de Crédito' }
]

export const FALLBACK_REMINDER_PRIORITIES = [
  { name: 'baja', label: 'Baja' },
  { name: 'media', label: 'Media' },
  { name: 'alta', label: 'Alta' },
  { name: 'urgente', label: 'Urgente' }
]

export const FALLBACK_COUNTRIES = [
  { name: 'Panamá', iso_code: 'PA', phone_prefix: '+507', flag_emoji: '🇵🇦', is_default: true },
  { name: 'Estados Unidos', iso_code: 'US', phone_prefix: '+1', flag_emoji: '🇺🇸', is_default: false },
  { name: 'España', iso_code: 'ES', phone_prefix: '+34', flag_emoji: '🇪🇸', is_default: false },
  { name: 'Colombia', iso_code: 'CO', phone_prefix: '+57', flag_emoji: '🇨🇴', is_default: false },
  { name: 'Costa Rica', iso_code: 'CR', phone_prefix: '+506', flag_emoji: '🇨🇷', is_default: false },
  { name: 'Venezuela', iso_code: 'VE', phone_prefix: '+58', flag_emoji: '🇻🇪', is_default: false },
  { name: 'México', iso_code: 'MX', phone_prefix: '+52', flag_emoji: '🇲🇽', is_default: false }
]

export const FALLBACK_POSITIONS = [
  'Presidente',
  'Vicepresidente',
  'Secretario',
  'Subsecretario',
  'Tesorero',
  'Subtesorero',
  'Representante Legal',
  'Representante Legal Suplente',
  'Director',
  'Director Presidente',
  'Director Secretario',
  'Director Tesorero',
  'Apoderado General',
  'Apoderado Especial',
  'Gerente General',
  'Gerente Administrativo',
  'Administrador',
  'Administrador Único',
  'Socio Administrador',
  'Ejecutivo Principal',
  'Oficial de Cumplimiento',
  'Agente Residente',
  'Liquidador',
  'Custodio de Acciones',
  'Fiduciario',
  'Protector de Fundación',
  'Beneficiario Controlador',
  'Firmante Autorizado',
  'Director Dignatario',
  'Profesional Idóneo Representante de Empresa (P.I.R.E.)'
]

export class CatalogService {
  private getSupabase() {
    return createClient()
  }

  async getLegalPersonTypes(): Promise<{ name: string; is_common: boolean }[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('legal_person_types')
        .select('name, is_common')
        .order('order_num', { ascending: true })
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data
    } catch {
      // Bulletproof Fallback: Convert the local array to the required object shape
      return LEGAL_PERSON_TYPES.map((type, idx) => ({
        name: type,
        is_common: idx < 5
      }))
    }
  }

  async getSocietyStatuses(): Promise<{ name: string; label: string }[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('society_statuses')
        .select('name, label')
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data
    } catch {
      return FALLBACK_SOCIETY_STATUSES
    }
  }

  async getUserRoles(): Promise<{ name: string; label: string }[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('user_roles')
        .select('name, label')
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data
    } catch {
      return FALLBACK_USER_ROLES
    }
  }

  async getPaymentMethods(): Promise<{ name: string; label: string }[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('payment_methods')
        .select('name, label')
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data
    } catch {
      return FALLBACK_PAYMENT_METHODS
    }
  }

  async getReminderPriorities(): Promise<{ name: string; label: string }[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('reminder_priorities')
        .select('name, label')
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data
    } catch {
      return FALLBACK_REMINDER_PRIORITIES
    }
  }

  async getCountries(): Promise<{ name: string; iso_code: string; phone_prefix: string; flag_emoji: string; is_default: boolean }[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('countries')
        .select('name, iso_code, phone_prefix, flag_emoji, is_default')
        .order('name', { ascending: true })
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data
    } catch {
      return FALLBACK_COUNTRIES
    }
  }

  async getContactPositions(): Promise<string[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('contact_positions')
        .select('name')
        .order('name', { ascending: true })
      
      if (error || !data || data.length === 0) throw new Error('Database catalogs not found, using fallback')
      return data.map(d => d.name)
    } catch {
      return FALLBACK_POSITIONS
    }
  }
}

export const catalogService = new CatalogService()
