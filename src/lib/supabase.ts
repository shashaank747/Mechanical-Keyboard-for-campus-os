import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase credentials are read strictly from environment variables
// Leave empty or unconfigured to operate in offline / local-storage mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseUrl.includes("your-project-id")
);

// Only initialize if valid external Supabase URL and Key are provided
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseStudentRow {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  ip_address: string;
  total_games_played: number;
  total_levels_mastered: number;
  code_sprint_solved: number;
  code_sprint_best_wpm: number;
  code_sprint_langs: string[];
  code_sprint_data: Record<string, unknown>;
  academy_highest_level: number;
  academy_completed_levels: number[];
  speed_best_wpm: number;
  speed_tests_taken: number;
  meteor_high_score: number;
  meteor_highest_wave: number;
  blind_completed_lines: number;
  shortcuts_mastered: number;
  last_active_game: string;
  progress_json: Record<string, unknown>;
  created_at?: string;
  last_login_at?: string;
  last_activity_at?: string;
}
