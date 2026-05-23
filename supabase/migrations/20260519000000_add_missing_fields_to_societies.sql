-- Agregar columnas faltantes a la tabla societies

ALTER TABLE public.societies 
ADD COLUMN IF NOT EXISTS internal_id text,
ADD COLUMN IF NOT EXISTS folio_number text,
ADD COLUMN IF NOT EXISTS registered_mici boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS registered_rubf boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS registered_dgi boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS additional_contacts jsonb DEFAULT '[]'::jsonb;
