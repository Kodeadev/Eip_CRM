-- Migration: 20260520000003_add_phone_prefix_to_tables.sql
-- Goal: Add phone_country_prefix column to societies table safely

ALTER TABLE public.societies 
ADD COLUMN IF NOT EXISTS phone_country_prefix VARCHAR(10) DEFAULT '+507';
