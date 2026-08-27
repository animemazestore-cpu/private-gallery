// Browser-safe Supabase client. Uses only NEXT_PUBLIC_* values.
// Per docs/ENVIRONMENT.md: "NEXT_PUBLIC_* values are browser-visible; never put secrets there."
// Should have no meaningful privileges beyond what anonymous RLS policies allow.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Browser-safe Supabase client singleton getter.
 * Initializes lazily to avoid throwing errors during Next.js build-time static analysis.
 * Uses the public anon key — no elevated privileges.
 * Safe to import from Client Components.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}
