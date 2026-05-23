-- Agregar columna created_by a la tabla societies
ALTER TABLE public.societies 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
