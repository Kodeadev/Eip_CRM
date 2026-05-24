-- Migración: Agregar índices para mejorar el rendimiento del dashboard y búsquedas
-- Creado: 2026-05-24

-- Índice para optimizar filtros por estado de sociedad (excluyendo borrados lógicos)
CREATE INDEX IF NOT EXISTS idx_societies_status 
ON public.societies(status) 
WHERE deleted_at IS NULL;

-- Índice para optimizar consultas de próximas fechas de cobro
CREATE INDEX IF NOT EXISTS idx_societies_next_payment_date 
ON public.societies(next_payment_date) 
WHERE deleted_at IS NULL;

-- Índice para búsquedas rápidas por identificador interno
CREATE INDEX IF NOT EXISTS idx_societies_internal_id 
ON public.societies(internal_id) 
WHERE deleted_at IS NULL;

-- Índice para ordenar cronológicamente las sociedades creadas
CREATE INDEX IF NOT EXISTS idx_societies_created_at 
ON public.societies(created_at) 
WHERE deleted_at IS NULL;
