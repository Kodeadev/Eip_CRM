-- Migration: 20260520000000_create_catalogs.sql
-- Goal: Create catalog tables for hardcoded types and statuses with strict fallback support

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.legal_person_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_common BOOLEAN DEFAULT FALSE,
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.society_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reminder_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.legal_person_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_priorities ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Allow everyone to read catalogs)
CREATE POLICY "Allow public select on legal_person_types" ON public.legal_person_types FOR SELECT USING (true);
CREATE POLICY "Allow public select on society_statuses" ON public.society_statuses FOR SELECT USING (true);
CREATE POLICY "Allow public select on user_roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Allow public select on payment_methods" ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY "Allow public select on reminder_priorities" ON public.reminder_priorities FOR SELECT USING (true);

-- 4. Seed Data

-- 4.1. Seed Society Statuses
INSERT INTO public.society_statuses (name, label) VALUES
('activa', 'Activa'),
('en trámite', 'En Trámite'),
('suspendida', 'Suspendida'),
('disuelta', 'Disuelta')
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;

-- 4.2. Seed User Roles
INSERT INTO public.user_roles (name, label) VALUES
('admin', 'Administrador'),
('empleado', 'Empleado'),
('cliente', 'Cliente')
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;

-- 4.3. Seed Payment Methods
INSERT INTO public.payment_methods (name, label) VALUES
('transferencia', 'Transferencia Bancaria'),
('efectivo', 'Efectivo'),
('cheque', 'Cheque'),
('tarjeta', 'Tarjeta de Crédito')
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;

-- 4.4. Seed Reminder Priorities
INSERT INTO public.reminder_priorities (name, label) VALUES
('baja', 'Baja'),
('media', 'Media'),
('alta', 'Alta'),
('urgente', 'Urgente')
ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;

-- 4.5. Seed Legal Person Types
INSERT INTO public.legal_person_types (name, is_common, order_num) VALUES
('Sociedad Anónima (S.A.)', true, 1),
('Sociedad de Responsabilidad Limitada (S.R.L.)', true, 2),
('Sociedad Internacional de Negocios (SIB)', true, 3),
('Fundación de Interés Privado', true, 4),
('Sucursal en el extranjero', true, 5),
('Sociedad de Emprendimiento', false, 6),
('Sociedad Colectiva', false, 7),
('Sociedad en Comandita Simple', false, 8),
('Sociedad en Comandita por Acciones', false, 9),
('Sociedad Civil', false, 10),
('Empresa Individual de Responsabilidad Limitada (EIRL)', false, 11),
('Sucursal de Sociedad Extranjera', false, 12),
('Fideicomiso', false, 13),
('Asociación Civil', false, 14),
('Asociación de Interés Público (AIP)', false, 15),
('Organización No Gubernamental (ONG)', false, 16),
('Fundación de Interés Público', false, 17),
('Cooperativa', false, 18),
('Asociación Religiosa', false, 19),
('Corporación Pública', false, 20),
('Empresa Estatal', false, 21),
('Entidad Autónoma', false, 22),
('Entidad Semiautónoma', false, 23),
('Municipio', false, 24),
('Junta Comunal', false, 25),
('Universidad Pública', false, 26),
('Sindicato', false, 27),
('Federación', false, 28),
('Confederación', false, 29),
('Consorcio', false, 30),
('Joint Venture', false, 31),
('Sociedad Accidental', false, 32),
('Sociedad de Hecho', false, 33),
('Cámara de Comercio', false, 34),
('Patronato', false, 35),
('Comité', false, 36),
('Colegio Profesional', false, 37),
('Caja de Ahorros y Crédito Cooperativa', false, 38),
('Fundación Bancaria', false, 39),
('Zona Franca bajo Persona Jurídica', false, 40),
('Sociedad Holding', false, 41),
('Sociedad Offshore', false, 42),
('Sociedad de Inversión', false, 43),
('Sociedad Inmobiliaria', false, 44),
('Sociedad Financiera', false, 45),
('Sociedad Bancaria', false, 46),
('Sociedad Aseguradora', false, 47),
('Reaseguradora', false, 48),
('Casa de Valores', false, 49),
('Administradora de Fondos', false, 50),
('Fundación Familiar', false, 51),
('Sociedad Agropecuaria', false, 52),
('Sociedad Marítima', false, 53),
('Sociedad Naviera', false, 54),
('Sociedad Industrial', false, 55),
('Sociedad Comercial', false, 56),
('Sociedad de Servicios', false, 57),
('Sociedad Tecnológica', false, 58),
('Sociedad Profesional', false, 59),
('Sociedad Médica', false, 60),
('Sociedad de Abogados', false, 61),
('Sociedad Contable', false, 62),
('Sociedad Auditora', false, 63),
('Sociedad Constructora', false, 64),
('Sociedad Minera', false, 65),
('Sociedad Energética', false, 66),
('Sociedad Turística', false, 67),
('Sociedad Hotelera', false, 68),
('Sociedad de Transporte', false, 69),
('Sociedad Logística', false, 70),
('Sociedad Educativa', false, 71),
('Sociedad Editorial', false, 72),
('Sociedad de Telecomunicaciones', false, 73),
('Sociedad de Capital Variable', false, 74),
('Sociedad Mixta', false, 75),
('Asociación de Propietarios', false, 76),
('Condominio con personalidad jurídica', false, 77),
('Fundación Educativa', false, 78),
('Fundación Cultural', false, 79),
('Fundación Científica', false, 80),
('Asociación Ambiental', false, 81),
('Asociación Benéfica', false, 82),
('Asociación Empresarial', false, 83),
('Asociación Profesional', false, 84),
('Asociación Cultural', false, 85),
('Asociación Estudiantil', false, 86),
('Asociación Comunitaria', false, 87)
ON CONFLICT (name) DO NOTHING;
