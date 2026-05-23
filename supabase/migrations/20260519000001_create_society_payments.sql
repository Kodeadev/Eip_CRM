-- Habilitar extensión requerida para el trigger de updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime schema extensions;

-- Tabla principal de pagos (sirve también como historial)
CREATE TABLE IF NOT EXISTS public.society_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE NOT NULL,
    payment_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de seguridad RLS
ALTER TABLE public.society_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver pagos"
ON public.society_payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear pagos"
ON public.society_payments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pagos"
ON public.society_payments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at_society_payments
BEFORE UPDATE ON public.society_payments
FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

-- Añadir society_payments a Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.society_payments;
