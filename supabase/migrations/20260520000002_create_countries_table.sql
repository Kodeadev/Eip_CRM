-- Migration: 20260520000002_create_countries_table.sql
-- Goal: Create countries catalog table and seed common phone prefixes

CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    iso_code VARCHAR(5) UNIQUE NOT NULL,
    phone_prefix VARCHAR(10) NOT NULL,
    flag_emoji TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Allow public read on countries
CREATE POLICY "Allow public read on countries" ON public.countries FOR SELECT USING (true);

-- Seed common countries with phone prefix
INSERT INTO public.countries (name, iso_code, phone_prefix, flag_emoji, is_default) VALUES
('Panamá', 'PA', '+507', '🇵🇦', true),
('Estados Unidos', 'US', '+1', '🇺🇸', false),
('España', 'ES', '+34', '🇪🇸', false),
('Colombia', 'CO', '+57', '🇨🇴', false),
('Costa Rica', 'CR', '+506', '🇨🇷', false),
('Venezuela', 'VE', '+58', '🇻🇪', false),
('México', 'MX', '+52', '🇲🇽', false)
ON CONFLICT (name) DO NOTHING;
