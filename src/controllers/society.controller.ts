'use server'

import { createClient } from '@/lib/supabase/server'
import { SocietyService } from '@/services/society.service'
import { ReminderService } from '@/services/reminder.service'
import { SocietyInput } from '@/validators/society'
import { revalidatePath } from 'next/cache'

export async function handleCreateSociety(data: SocietyInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const societyService = new SocietyService(supabase)
    const reminderService = new ReminderService(supabase)

    // Extraer documentos si existen
    const { new_documents, ...societyData } = data;

    // 1. Crear Sociedad
    const result = await societyService.createSociety(societyData as SocietyInput, userId)

    // 2. Agregar Documentos (si hay)
    if (new_documents && new_documents.length > 0) {
      await societyService.addDocuments(result.id, new_documents)
    }

    revalidatePath('/dashboard/sociedades')
    revalidatePath('/dashboard')
    return { success: true, data: result }
  } catch (error: any) {
    if (error.code === '23505' || error.message?.includes('societies_internal_id_unique') || error.message?.includes('internal_id')) {
      return { success: false, error: 'El Identificador Interno ya está registrado para otra sociedad. Por favor ingresa uno diferente.' }
    }
    if (error.message?.includes('societies_ruc_key') || error.message?.includes('ruc')) {
      return { success: false, error: 'El RUC ingresado ya está registrado para otra sociedad.' }
    }
    return { success: false, error: error.message || 'Error al crear sociedad' }
  }
}

export async function handleListSocieties() {
  try {
    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    const data = await societyService.listSocieties()
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al listar sociedades' }
  }
}

export async function handleGetSociety(id: string) {
  try {
    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    const data = await societyService.getSociety(id)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener sociedad' }
  }
}

export async function handleUpdateSociety(id: string, data: Partial<SocietyInput>) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    const societyService = new SocietyService(supabase)
    
    // Extraer documentos si existen
    const { new_documents, ...societyData } = data;
    
    const result = await societyService.updateSociety(id, societyData, userId)
    
    // Agregar Documentos (si hay)
    if (new_documents && new_documents.length > 0) {
      await societyService.addDocuments(id, new_documents)
    }
    
    revalidatePath('/dashboard/sociedades')
    revalidatePath(`/dashboard/sociedades/${id}`)
    return { success: true, data: result }
  } catch (error: any) {
    if (error.code === '23505' || error.message?.includes('societies_internal_id_unique') || error.message?.includes('internal_id')) {
      return { success: false, error: 'El Identificador Interno ya está registrado para otra sociedad. Por favor ingresa uno diferente.' }
    }
    if (error.message?.includes('societies_ruc_key') || error.message?.includes('ruc')) {
      return { success: false, error: 'El RUC ingresado ya está registrado para otra sociedad.' }
    }
    console.error('--- handleUpdateSociety ERROR ---', error);
    return { success: false, error: error.message || 'Error al actualizar sociedad' }
  }
}

export async function handleDeleteSociety(id: string) {
  try {
    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    await societyService.deleteSociety(id)
    revalidatePath('/dashboard/sociedades')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar sociedad' }
  }
}

export async function handleGetNextInternalId() {
  try {
    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    const nextId = await societyService.getNextInternalId()
    return { success: true, data: nextId }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al calcular ID interno' }
  }
}
