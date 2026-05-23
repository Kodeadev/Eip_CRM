import { z } from 'zod'

export const societySchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  internal_id: z.string().nullish(),
  ruc: z.string().nullish(),
  dv: z.string().nullish(),
  folio_number: z.string().nullish(),
  constitution_date: z.string().nullish(),
  legal_person_type: z.string().nullish(),
  status: z.enum(['activa', 'suspendida', 'en trámite', 'disuelta'], { message: 'Estado inválido' }),
  created_by: z.string().uuid({ message: 'Usuario creador inválido' }).nullish().or(z.literal('')),
  
  // Contacto
  legal_representative: z.string().nullish(),
  email: z.string().email({ message: 'Correo inválido' }).nullish().or(z.literal('')),
  phone: z.string().nullish(),
  phone_country_prefix: z.string().nullish(),
  contact_name: z.string().nullish(),
  address: z.string().nullish(),
  
  additional_contacts: z.array(z.object({
    name: z.string().nullish(),
    email: z.string().email({ message: 'Correo inválido' }).nullish().or(z.literal('')),
    phone: z.string().nullish(),
    phone_country_prefix: z.string().nullish(),
    role: z.string().nullish(),
  })).nullish(),
  
  // Control Interno
  expedient_number: z.string().nullish(),
  observations: z.string().nullish(),
  
  // Registros
  registered_mici: z.boolean().nullish(),
  registered_rubf: z.boolean().nullish(),
  registered_dgi: z.boolean().nullish(),
  
  // Documentos subidos (Metadata para pasar al controlador)
  new_documents: z.array(z.object({
    name: z.string(),
    file_path: z.string(),
    file_type: z.string().optional(),
    file_size: z.number().optional(),
  })).nullish(),
})

export type SocietyInput = z.infer<typeof societySchema>
