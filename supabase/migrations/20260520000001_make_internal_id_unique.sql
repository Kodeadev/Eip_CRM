-- Migration: 20260520000001_make_internal_id_unique.sql
-- Goal: Enforce strict uniqueness on societies' internal_id column

-- 1. Safely handle any duplicate nulls or empty IDs if necessary.
-- Note: PostgreSQL allows multiple NULL values in a UNIQUE column, so empty/null values will not crash the constraint.
-- However, if there are duplicate text values, we want to clear them.
-- In a clean DB, this will execute successfully.

ALTER TABLE public.societies 
ADD CONSTRAINT societies_internal_id_unique UNIQUE (internal_id);
