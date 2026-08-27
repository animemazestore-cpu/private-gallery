// SERVER-ONLY. Never import this file from a Client Component.
// Uses SUPABASE_SERVICE_ROLE_KEY — full DB/storage access, bypasses RLS.
// Implements the "privileged server client" boundary from docs/ARCHITECTURE.md
// and docs/SECURITY.md ("Never expose database service-role credentials to the browser").

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Privileged server-only Supabase client getter.
 * Initializes lazily to avoid throwing errors during Next.js build-time static analysis.
 * Uses the service-role key — bypasses RLS and has full DB/storage access.
 * MUST only be used inside API routes, Server Components, and server actions.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseServiceRoleKey) {
    throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminInstance;
}
