import { SupabaseClient } from '@supabase/supabase-js'
import { PaymentInput } from '@/validators/payment'

export class PaymentService {
  constructor(private supabase: SupabaseClient) {}

  async createPayment(data: PaymentInput) {
    // Necesitamos obtener el usuario actual para 'created_by'
    const { data: authData } = await this.supabase.auth.getUser()
    
    const paymentData = {
      ...data,
      created_by: authData.user?.id || null
    }

    const { data: result, error } = await this.supabase
      .from('society_payments')
      .insert(paymentData)
      .select()
      .single()
    
    if (error) throw error
    return result
  }
  async getPayment(id: string) {
    const { data, error } = await this.supabase
      .from('society_payments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async updatePayment(id: string, data: Partial<PaymentInput>) {
    const { data: result, error } = await this.supabase
      .from('society_payments')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }
  async getPayments(filter?: { filterType?: string }) {
    let query = this.supabase
      .from('society_payments')
      .select(`
        *,
        societies (
          id,
          name,
          internal_id,
          ruc
        )
      `)
      .order('payment_date', { ascending: false })

    if (filter?.filterType === 'upcoming') {
      const today = new Date().toISOString().split('T')[0]
      const in30Days = new Date()
      in30Days.setDate(in30Days.getDate() + 30)
      const in30DaysStr = in30Days.toISOString().split('T')[0]
      
      query = query
        .gte('next_due_date', today)
        .lte('next_due_date', in30DaysStr)
    } else if (filter?.filterType === 'overdue') {
      const today = new Date().toISOString().split('T')[0]
      query = query.lt('next_due_date', today)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  }

  async getPaymentsBySociety(societyId: string) {
    const { data, error } = await this.supabase
      .from('society_payments')
      .select('*')
      .eq('society_id', societyId)
      .order('payment_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  async addDocuments(paymentId: string, documents: any[]) {
    const { data: authData } = await this.supabase.auth.getUser()
    
    const docsToInsert = documents.map(doc => ({
      ...doc,
      payment_id: paymentId,
      created_by: authData.user?.id || null
    }))

    const { error } = await this.supabase
      .from('payment_documents')
      .insert(docsToInsert)
    
    if (error) throw error
  }

  async getDocuments(paymentId: string) {
    const { data, error } = await this.supabase
      .from('payment_documents')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error

    // Generar URLs firmadas para acceso privado (válidas por 1 hora)
    if (data && data.length > 0) {
      for (const doc of data) {
        const { data: signedData, error: signedError } = await this.supabase.storage
          .from('payment_documents')
          .createSignedUrl(doc.file_path, 60 * 60) // 1 hora
        
        if (!signedError && signedData) {
          doc.signed_url = signedData.signedUrl
        }
      }
    }

    return data
  }
}
