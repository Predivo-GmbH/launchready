-- ===================================================================
-- LaunchReady: base schema capture — the public.audits table
-- ===================================================================
-- CAPTURED FROM LIVE PRODUCTION 2026-08-21 (project ref hcfeoescybfngjsphekq)
-- via information_schema / pg_get_constraintdef / pg_indexes / pg_policies.
--
-- WHY THIS FILE EXISTS: the `audits` table was created manually in prod
-- (Supabase Dashboard/SQL Editor) before migrations were tracked, and no
-- migration file ever created it. Staging therefore lacked it entirely,
-- which made 20260310_add_plans_and_monitoring.sql (which ALTERs audits)
-- un-runnable anywhere but prod. This file recreates the prod schema
-- EXACTLY as found, so a fresh database can replay the full history.
--
-- This schema PREDATES 20260310: it deliberately does NOT include the
-- is_monitoring / monitored_site_id columns or the idx_audits_user_month /
-- idx_audits_monitoring indexes — those arrive with 20260310.
--
-- Idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS guards): prod already
-- has all of this, so replaying there is a no-op. No triggers existed on
-- audits in prod (verified 2026-08-21), so none are created here.
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  overall_score integer NOT NULL,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  pages_crawled integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own audits" ON public.audits;
CREATE POLICY "Users can read own audits"
  ON public.audits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audits" ON public.audits;
CREATE POLICY "Users can insert own audits"
  ON public.audits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS audits_user_id_idx
  ON public.audits USING btree (user_id);

CREATE INDEX IF NOT EXISTS audits_created_at_idx
  ON public.audits USING btree (created_at DESC);

-- Matches prod grants exactly (Supabase default-privilege shape, verified
-- 2026-08-21 in information_schema.role_table_grants).
GRANT ALL ON public.audits TO anon, authenticated, service_role;
