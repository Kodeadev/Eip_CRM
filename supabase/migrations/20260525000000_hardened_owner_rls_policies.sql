-- Migration: 20260525000000_hardened_owner_rls_policies.sql
-- Goal: Harden RLS policies by restricting sensitive logs, history, and integration configs 
-- exclusively to the system owner: info@expatimmigrationpanama.com
-- Handle missing tables gracefully.

DO $$
BEGIN
    -- ==========================================
    -- 1. Restringir la tabla society_history
    -- ==========================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'society_history') THEN
        DROP POLICY IF EXISTS "Usuarios autenticados pueden ver historial" ON public.society_history;
        DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar historial" ON public.society_history;
        DROP POLICY IF EXISTS "Owner only select society_history" ON public.society_history;
        DROP POLICY IF EXISTS "Authorized staff insert society_history" ON public.society_history;

        CREATE POLICY "Owner only select society_history" ON public.society_history
          FOR SELECT TO authenticated
          USING (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com');

        CREATE POLICY "Authorized staff insert society_history" ON public.society_history
          FOR INSERT TO authenticated
          WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'empleado'));
    END IF;

    -- ==========================================
    -- 2. Restringir la tabla reminder_logs
    -- ==========================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reminder_logs') THEN
        DROP POLICY IF EXISTS "Usuarios autenticados pueden ver logs de recordatorios" ON public.reminder_logs;
        DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar logs de recordatorios" ON public.reminder_logs;
        DROP POLICY IF EXISTS "Owner only select reminder_logs" ON public.reminder_logs;
        DROP POLICY IF EXISTS "Staff insert reminder_logs" ON public.reminder_logs;

        CREATE POLICY "Owner only select reminder_logs" ON public.reminder_logs
          FOR SELECT TO authenticated
          USING (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com');

        CREATE POLICY "Staff insert reminder_logs" ON public.reminder_logs
          FOR INSERT TO authenticated
          WITH CHECK (true);
    END IF;

    -- ==========================================
    -- 2b. Restringir la tabla reminder_notifications (Historial real en producción)
    -- ==========================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reminder_notifications') THEN
        ALTER TABLE public.reminder_notifications ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Owner only select reminder_notifications" ON public.reminder_notifications;
        DROP POLICY IF EXISTS "Staff insert reminder_notifications" ON public.reminder_notifications;

        CREATE POLICY "Owner only select reminder_notifications" ON public.reminder_notifications
          FOR SELECT TO authenticated
          USING (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com');

        CREATE POLICY "Staff insert reminder_notifications" ON public.reminder_notifications
          FOR INSERT TO authenticated
          WITH CHECK (true);
    END IF;

    -- ==========================================
    -- 3. Restringir configs de SMTP y Twilio (notification_providers)
    -- ==========================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notification_providers') THEN
        ALTER TABLE public.notification_providers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Owner manage providers" ON public.notification_providers;
        DROP POLICY IF EXISTS "Owner manage notification_providers" ON public.notification_providers;

        CREATE POLICY "Owner manage notification_providers" ON public.notification_providers
          FOR ALL TO authenticated
          USING (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com')
          WITH CHECK (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com');
    END IF;

    -- ==========================================
    -- 4. Restringir reglas de envío automático (reminder_settings)
    -- ==========================================
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reminder_settings') THEN
        ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Owner manage settings" ON public.reminder_settings;
        DROP POLICY IF EXISTS "Staff select reminder_settings" ON public.reminder_settings;
        DROP POLICY IF EXISTS "Owner manage reminder_settings" ON public.reminder_settings;

        CREATE POLICY "Staff select reminder_settings" ON public.reminder_settings
          FOR SELECT TO authenticated
          USING (true);

        CREATE POLICY "Owner manage reminder_settings" ON public.reminder_settings
          FOR ALL TO authenticated
          USING (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com')
          WITH CHECK (auth.jwt() ->> 'email' = 'info@expatimmigrationpanama.com');
    END IF;
END $$;
