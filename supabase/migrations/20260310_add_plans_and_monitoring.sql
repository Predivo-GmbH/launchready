-- ===================================================================
-- LaunchReady: User Plans + Monitoring Tables
-- Applied automatically by scripts/apply-migrations.mjs in CI (deploy
-- workflows) via the Supabase Management API. Do NOT run manually in the
-- Supabase SQL Editor — manual application bypasses the
-- supabase_migrations.schema_migrations ledger and recreates the drift this
-- pipeline exists to prevent.
-- ===================================================================

-- 1. User Plans table
-- Tracks each user's subscription plan (free/starter/pro)
CREATE TABLE IF NOT EXISTS user_plans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own plan" ON user_plans;
CREATE POLICY "Users can read own plan"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-create a free plan row when a new user signs up
CREATE OR REPLACE FUNCTION create_user_plan()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_plans (user_id, plan) VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_plan();

-- Backfill: create plan rows for existing users who don't have one
INSERT INTO user_plans (user_id, plan)
SELECT id, 'free' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_plans);

-- 2. Monitored Sites table
-- Pro users can monitor up to 5 sites with weekly re-audits
CREATE TABLE IF NOT EXISTS monitored_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  last_score integer,
  prev_score integer,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own monitored sites" ON monitored_sites;
CREATE POLICY "Users can manage own monitored sites"
  ON monitored_sites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add monitoring columns to audits table
ALTER TABLE audits ADD COLUMN IF NOT EXISTS is_monitoring boolean DEFAULT false;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS monitored_site_id uuid REFERENCES monitored_sites(id);

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_audits_user_month
  ON audits (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audits_monitoring
  ON audits (monitored_site_id)
  WHERE is_monitoring = true;

CREATE INDEX IF NOT EXISTS idx_monitored_sites_user
  ON monitored_sites (user_id)
  WHERE active = true;

-- 5. pg_cron: weekly monitoring job (runs every Sunday at 06:00 UTC)
-- NOTE: This requires pg_cron extension enabled in Supabase Dashboard → Database → Extensions
-- Uncomment after enabling pg_cron and deploying the run-monitoring Edge Function:
--
-- SELECT cron.schedule(
--   'weekly-monitoring-audit',
--   '0 6 * * 0',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/run-monitoring',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
