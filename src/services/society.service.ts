import { SupabaseClient } from '@supabase/supabase-js'
import { SocietyInput } from '@/validators/society'

export class SocietyService {
  constructor(private supabase: SupabaseClient) {}

  async listSocieties(filter?: { status?: string }) {
    let query = this.supabase
      .from('societies')
      .select('*')
      .is('deleted_at', null)

    if (filter?.status) {
      let dbStatus = filter.status
      if (dbStatus === 'en_tramite') {
        dbStatus = 'en trámite'
      }
      query = query.eq('status', dbStatus)
    }

    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  async getSociety(id: string) {
    const { data, error } = await this.supabase
      .from('societies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async createHistory(societyId: string, action: string, changes?: Record<string, any>, userId?: string) {
    const { error } = await this.supabase
      .from('society_history')
      .insert({
        society_id: societyId,
        action,
        changes,
        user_id: userId
      })
    if (error) console.error('Error logging history:', error)
  }

  async getHistory(societyId: string) {
    const { data, error } = await this.supabase
      .from('society_history')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async createSociety(data: SocietyInput, userId?: string) {
    const { data: result, error } = await this.supabase
      .from('societies')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error

    // Registrar en historial
    await this.createHistory(result.id, 'Creación de Sociedad', {
      nombre: { old: null, new: result.name },
      estado: { old: null, new: result.status },
      identificador_interno: { old: null, new: result.internal_id }
    }, userId)

    return result
  }

  async updateSociety(id: string, data: Partial<SocietyInput> & Record<string, any>, userId?: string) {
    // 1. Obtener datos anteriores
    const oldData = await this.getSociety(id)

    // 2. Ejecutar actualización
    const { data: result, error } = await this.supabase
      .from('societies')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    // 3. Calcular diferencias
    const changes: Record<string, { old: any; new: any }> = {}
    const keysToTrack = [
      'name', 'internal_id', 'ruc', 'dv', 'folio_number', 
      'constitution_date', 'legal_person_type', 'status', 
      'legal_representative', 'email', 'phone', 'phone_country_prefix',
      'address', 'expedient_number', 'observations',
      'registered_mici', 'registered_rubf', 'registered_dgi'
    ]

    for (const key of keysToTrack) {
      const oldVal = oldData[key]
      const newVal = data[key]

      if (newVal !== undefined && newVal !== oldVal) {
        changes[key] = {
          old: oldVal === null ? 'N/D' : oldVal,
          new: newVal === null ? 'N/D' : newVal
        }
      }
    }

    // 4. Si hay cambios reales, registrarlos en el historial
    if (Object.keys(changes).length > 0) {
      await this.createHistory(id, 'Modificación de Datos', changes, userId)
    }

    return result
  }

  async deleteSociety(id: string) {
    // Soft delete
    const { error } = await this.supabase
      .from('societies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }

  async addDocuments(societyId: string, documents: any[]) {
    const docsToInsert = documents.map(doc => ({
      ...doc,
      society_id: societyId
    }))

    const { data, error } = await this.supabase
      .from('society_documents')
      .insert(docsToInsert)
      .select()
    
    if (error) throw error
    return data
  }

  async getDocuments(societyId: string) {
    const { data, error } = await this.supabase
      .from('society_documents')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error

    // Generar URLs firmadas para acceso privado (válidas por 1 hora)
    if (data && data.length > 0) {
      for (const doc of data) {
        const { data: signedData, error: signedError } = await this.supabase.storage
          .from('society_documents')
          .createSignedUrl(doc.file_path, 60 * 60) // 1 hora
        
        if (!signedError && signedData) {
          doc.signed_url = signedData.signedUrl
        }
      }
    }

    return data
  }

  async getNextInternalId(): Promise<string> {
    const { data, error } = await this.supabase
      .from('societies')
      .select('internal_id')
      .is('deleted_at', null)
    
    if (error) throw error
    
    const ids = (data || [])
      .map(s => parseInt(s.internal_id || '0', 10))
      .filter(id => !isNaN(id))
    
    const maxId = ids.length > 0 ? Math.max(...ids) : 0
    const nextId = maxId + 1
    
    // Rellenar con ceros a la izquierda (ej. 001, 002, etc.)
    return String(nextId).padStart(3, '0')
  }
}
