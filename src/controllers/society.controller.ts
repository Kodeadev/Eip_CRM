'use server'

import { createClient } from '@/lib/supabase/server'
import { SocietyService } from '@/services/society.service'
import { ReminderService } from '@/services/reminder.service'
import { societySchema, SocietyInput } from '@/validators/society'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function handleCreateSociety(rawData: unknown) {
  try {
    // SECURITY: Require authenticated user (admin or empleado)
    const authUser = await requireAuth(['admin', 'empleado'])

    // SECURITY: Server-side Zod validation
    const parsed = societySchema.safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }
    const data = parsed.data

    const supabase = await createClient()
    const societyService = new SocietyService(supabase)

    // Extraer documentos si existen
    const { new_documents, ...societyData } = data;

    // 1. Crear Sociedad
    const result = await societyService.createSociety(societyData as SocietyInput, authUser.id)

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
    // SECURITY: Require authenticated user
    await requireAuth()

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
    // SECURITY: Require authenticated user
    await requireAuth()

    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    const data = await societyService.getSociety(id)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener sociedad' }
  }
}

export async function handleUpdateSociety(id: string, rawData: unknown) {
  try {
    // SECURITY: Require authenticated user (admin or empleado)
    const authUser = await requireAuth(['admin', 'empleado'])

    // SECURITY: Server-side partial validation
    const parsed = societySchema.partial().safeParse(rawData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' }
    }
    const data = parsed.data

    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    
    // Extraer documentos si existen
    const { new_documents, ...societyData } = data;
    
    const result = await societyService.updateSociety(id, societyData, authUser.id)
    
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
    return { success: false, error: error.message || 'Error al actualizar sociedad' }
  }
}

export async function handleDeleteSociety(id: string) {
  try {
    // SECURITY: Admin-only operation
    await requireAuth(['admin'])

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
    // SECURITY: Require authenticated user
    await requireAuth()

    const supabase = await createClient()
    const societyService = new SocietyService(supabase)
    const nextId = await societyService.getNextInternalId()
    return { success: true, data: nextId }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al calcular ID interno' }
  }
}
