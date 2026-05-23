-- Migration: 20260520000005_create_contact_positions_table.sql
-- Goal: Create a database catalog for corporate and legal contact positions to replace hardcoded roles

-- 1. Crear tabla catalog de cargos
CREATE TABLE IF NOT EXISTS public.contact_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Seguridad a nivel de filas)
ALTER TABLE public.contact_positions ENABLE ROW LEVEL SECURITY;

-- 3. Permitir lectura pública de los cargos
CREATE POLICY "Allow public read on contact_positions" ON public.contact_positions FOR SELECT USING (true);

-- 4. Sembrar la lista oficial de cargos proporcionada por el usuario
INSERT INTO public.contact_positions (name) VALUES
('Presidente'),
('Vicepresidente'),
('Secretario'),
('Subsecretario'),
('Tesorero'),
('Subtesorero'),
('Representante Legal'),
('Representante Legal Suplente'),
('Director'),
('Director Presidente'),
('Director Secretario'),
('Director Tesorero'),
('Apoderado General'),
('Apoderado Especial'),
('Gerente General'),
('Gerente Administrativo'),
('Administrador'),
('Administrador Único'),
('Socio Administrador'),
('Ejecutivo Principal'),
('Oficial de Cumplimiento'),
('Agente Residente'),
('Liquidador'),
('Custodio de Acciones'),
('Fiduciario'),
('Protector de Fundación'),
('Beneficiario Controlador'),
('Firmante Autorizado'),
('Director Dignatario'),
('Profesional Idóneo Representante de Empresa (P.I.R.E.)')
ON CONFLICT (name) DO NOTHING;
