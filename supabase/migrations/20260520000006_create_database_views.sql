-- Migration: 20260520000006_create_database_views.sql
-- Goal: Create SQL Views (virtual tables) that join related tables with the societies table 
--       to display the internal_id and society_name directly in database managers/Supabase.

-- 1. Vista para Pagos (Payments)
CREATE OR REPLACE VIEW public.view_payments AS
SELECT 
    p.id,
    p.society_id,
    s.internal_id AS society_internal_id,
    s.name AS society_name,
    p.amount,
    p.payment_date,
    p.concept,
    p.payment_method,
    p.reference_number,
    p.created_at
FROM public.payments p
LEFT JOIN public.societies s ON p.society_id = s.id;

-- 2. Vista para Recordatorios (Reminders)
CREATE OR REPLACE VIEW public.view_reminders AS
SELECT 
    r.id,
    r.society_id,
    s.internal_id AS society_internal_id,
    s.name AS society_name,
    r.title,
    r.description,
    r.due_date,
    r.priority,
    r.status,
    r.created_at
FROM public.reminders r
LEFT JOIN public.societies s ON r.society_id = s.id;

-- 3. Vista para Historial de Cambios (Society History)
CREATE OR REPLACE VIEW public.view_society_history AS
SELECT 
    h.id,
    h.society_id,
    s.internal_id AS society_internal_id,
    s.name AS society_name,
    h.user_id,
    h.action,
    h.changes,
    h.created_at
FROM public.society_history h
LEFT JOIN public.societies s ON h.society_id = s.id;

-- 4. Vista para Documentos (Society Documents)
CREATE OR REPLACE VIEW public.view_society_documents AS
SELECT 
    d.id,
    d.society_id,
    s.internal_id AS society_internal_id,
    s.name AS society_name,
    d.name AS document_name,
    d.file_path,
    d.file_type,
    d.file_size,
    d.created_at
FROM public.society_documents d
LEFT JOIN public.societies s ON d.society_id = s.id;

-- Otorgar permisos de lectura a los usuarios autenticados para las nuevas vistas
GRANT SELECT ON public.view_payments TO authenticated;
GRANT SELECT ON public.view_reminders TO authenticated;
GRANT SELECT ON public.view_society_history TO authenticated;
GRANT SELECT ON public.view_society_documents TO authenticated;
