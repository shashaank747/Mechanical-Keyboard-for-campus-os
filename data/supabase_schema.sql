-- ==============================================================================
-- 🚀 STUDENT PROGRESS & ANALYTICS DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  theme_id TEXT DEFAULT 'studio-light',
  color_zones BOOLEAN DEFAULT false,
  preferences_json JSONB DEFAULT '{"themeId": "studio-light", "colorZones": false}'::jsonb,
  total_games_played INT DEFAULT 0,
  total_levels_mastered INT DEFAULT 0,
  code_sprint_solved INT DEFAULT 0,
  code_sprint_best_wpm INT DEFAULT 0,
  code_sprint_langs JSONB DEFAULT '[]'::jsonb,
  code_sprint_data JSONB DEFAULT '{}'::jsonb,
  academy_highest_level INT DEFAULT 0,
  academy_completed_levels JSONB DEFAULT '[]'::jsonb,
  speed_best_wpm INT DEFAULT 0,
  speed_tests_taken INT DEFAULT 0,
  meteor_high_score INT DEFAULT 0,
  meteor_highest_wave INT DEFAULT 0,
  blind_completed_lines INT DEFAULT 0,
  shortcuts_mastered INT DEFAULT 0,
  last_active_game TEXT DEFAULT 'None',
  progress_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'studio-light';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS color_zones BOOLEAN DEFAULT false;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS preferences_json JSONB DEFAULT '{"themeId": "studio-light", "colorZones": false}'::jsonb;

-- Grant full access so Vercel live users can save progress, themes, and sign in
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all public operations on students" ON public.students;
CREATE POLICY "Allow all public operations on students" ON public.students
  FOR ALL USING (true) WITH CHECK (true);

-- Insert Initial Admin / Demo Accounts
INSERT INTO public.students (
  user_id,
  username,
  email,
  password_hash,
  ip_address,
  total_games_played,
  total_levels_mastered,
  last_active_game
) VALUES (
  'USR-ADMIN01',
  'admin',
  'admin@keyboard.io',
  'pbkdf2$6dd34b7ebf3f38e0f3645c0768597dee$ecff072f2e55c572fc6a386d69084ebd9ead647c222065124e1fa2ce78e168b466bdb6b72a562f0d81a95729b56de524070e04a098519dd161b919c72a447844',
  '127.0.0.1',
  0,
  0,
  'Admin Console'
) ON CONFLICT (user_id) DO NOTHING;
