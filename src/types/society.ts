export type SocietyStatus = 'activa' | 'suspendida' | 'en trámite' | 'disuelta'

export interface Society {
  id: string
  name: string
  ruc?: string
  dv?: string
  constitution_date?: string
  legal_person_type?: string
  status: SocietyStatus
  
  // Contacto
  legal_representative?: string
  email?: string
  phone?: string
  contact_name?: string
  address?: string
  
  // Control Interno
  expedient_number?: string
  last_payment_date?: string
  next_payment_date?: string
  observations?: string
  
  // Auditoría
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface SocietyDocument {
  id: string
  society_id: string
  name: string
  file_path: string
  file_type?: string
  file_size?: number
  created_at: string
}

export interface SocietyHistory {
  id: string
  society_id: string
  user_id?: string
  action: string
  changes?: Record<string, any>
  created_at: string
}
