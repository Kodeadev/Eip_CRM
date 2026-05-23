-- Tabla para documentos asociados a pagos
CREATE TABLE IF NOT EXISTS public.payment_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_id UUID REFERENCES public.society_payments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de seguridad RLS
ALTER TABLE public.payment_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver documentos de pagos"
ON public.payment_documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear documentos de pagos"
ON public.payment_documents FOR INSERT
TO authenticated
WITH CHECK (true);

-- Añadir payment_documents a Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_documents;
