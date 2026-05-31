-- =====================================================================
-- CareerPilot AI — Supabase Database Schema
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- =====================================================================

-- 1. USER PROFILES
-- Stores full candidate profile data used for resume tailoring
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline      TEXT,
  location      TEXT,
  bio           TEXT,
  experiences   JSONB    DEFAULT '[]'::jsonb,
  education     JSONB    DEFAULT '[]'::jsonb,
  skills        JSONB    DEFAULT '[]'::jsonb,
  projects      JSONB    DEFAULT '[]'::jsonb,
  certifications JSONB   DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass (backend uses service key)
CREATE POLICY "Service role full access to user_profiles"
  ON public.user_profiles FOR ALL
  USING (auth.role() = 'service_role');


-- 2. RESUME EXPORTS
-- Stores every resume that was downloaded/exported from Resume Studio
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resume_exports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_data   JSONB    NOT NULL DEFAULT '{}'::jsonb,
  filename      TEXT     NOT NULL DEFAULT 'resume.json',
  ats_score     INTEGER  DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for fast history queries (newest first)
CREATE INDEX IF NOT EXISTS idx_resume_exports_user_id_created
  ON public.resume_exports(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_exports
CREATE POLICY "Users can view their own exports"
  ON public.resume_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports"
  ON public.resume_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to resume_exports"
  ON public.resume_exports FOR ALL
  USING (auth.role() = 'service_role');


-- 3. RL FEEDBACK
-- Stores reinforcement learning bullet-ranking feedback per user
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rl_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id     TEXT,
  bullet_text   TEXT     NOT NULL,
  bullet_hash   TEXT     NOT NULL,
  section       TEXT     NOT NULL,
  user_action   TEXT     NOT NULL,   -- 'kept' | 'edited' | 'deleted' | 'downloaded'
  score_before  FLOAT    DEFAULT 0.5,
  score_after   FLOAT    DEFAULT 0.5,
  reward        FLOAT    DEFAULT 0.0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for fast per-user bullet score lookups
CREATE INDEX IF NOT EXISTS idx_rl_feedback_user_id ON public.rl_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rl_feedback_bullet_hash ON public.rl_feedback(bullet_hash);

-- Enable Row Level Security
ALTER TABLE public.rl_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rl_feedback
CREATE POLICY "Users can view their own feedback"
  ON public.rl_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON public.rl_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to rl_feedback"
  ON public.rl_feedback FOR ALL
  USING (auth.role() = 'service_role');


-- 4. JD CACHE
-- Caches parsed JD analysis results (by MD5 hash) and company intel
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jd_cache (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jd_hash        TEXT     UNIQUE,
  company_name   TEXT,
  parsed_result  JSONB    DEFAULT '{}'::jsonb,
  company_intel  JSONB,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Index for fast hash lookups and company name lookups
CREATE INDEX IF NOT EXISTS idx_jd_cache_jd_hash      ON public.jd_cache(jd_hash);
CREATE INDEX IF NOT EXISTS idx_jd_cache_company_name ON public.jd_cache(company_name);

-- Enable Row Level Security
ALTER TABLE public.jd_cache ENABLE ROW LEVEL SECURITY;

-- jd_cache is a shared cache — readable by all authenticated users
CREATE POLICY "All authenticated users can read jd_cache"
  ON public.jd_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role full access to jd_cache"
  ON public.jd_cache FOR ALL
  USING (auth.role() = 'service_role');


-- =====================================================================
-- OPTIONAL: Auto-update updated_at on user_profiles
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =====================================================================
-- Done! All 4 tables created with RLS, indexes, and service-role bypass.
-- =====================================================================
