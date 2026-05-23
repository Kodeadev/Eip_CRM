-- 1. Crear los buckets si no existen
INSERT INTO storage.buckets (id, name, public) 
VALUES ('society_documents', 'society_documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_documents', 'payment_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas para 'society_documents'
-- Permitir a usuarios autenticados subir archivos
CREATE POLICY "Usuarios pueden subir documentos de sociedades" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'society_documents');

-- Permitir a usuarios autenticados ver archivos (necesario para URLs firmadas)
CREATE POLICY "Usuarios pueden ver documentos de sociedades" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'society_documents');

-- Permitir a usuarios autenticados actualizar/borrar
CREATE POLICY "Usuarios pueden editar documentos de sociedades" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'society_documents');

CREATE POLICY "Usuarios pueden borrar documentos de sociedades" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'society_documents');


-- 3. Políticas para 'payment_documents'
-- Permitir a usuarios autenticados subir archivos
CREATE POLICY "Usuarios pueden subir documentos de pagos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'payment_documents');

-- Permitir a usuarios autenticados ver archivos (necesario para URLs firmadas)
CREATE POLICY "Usuarios pueden ver documentos de pagos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'payment_documents');

-- Permitir a usuarios autenticados actualizar/borrar
CREATE POLICY "Usuarios pueden editar documentos de pagos" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'payment_documents');

CREATE POLICY "Usuarios pueden borrar documentos de pagos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'payment_documents');
