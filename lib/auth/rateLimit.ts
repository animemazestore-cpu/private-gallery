// Rate limiting for auth endpoints (docs/SECURITY.md, docs/TESTING.md:
// "Repeated failed attempts trigger rate limiting").
// Backed by the durable 'rate_limits' database table.

import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface RateLimitResult {
  allowed: boolean;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Check and record an authentication attempt for a given identifier key (e.g., client IP).
 * If the rate limit is exceeded, return allowed: false.
 */
export async function checkAndRecordAttempt(
  key: string
): Promise<RateLimitResult> {
  try {
    const now = new Date();

    // 1. Fetch current rate limit record for the key
    const { data: record, error: fetchError } = await getSupabaseAdmin()
      .from("rate_limits")
      .select("attempts, last_attempt_at")
      .eq("key", key)
      .single();

    // Handle DB error (PGRST116 means no row found, which is expected for new keys)
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Database error fetching rate limits:", fetchError.message);
      // Fail-open to avoid locking out users in case of temporary database outage
      return { allowed: true };
    }

    if (!record) {
      // First attempt: insert new record
      const { error: insertError } = await getSupabaseAdmin()
        .from("rate_limits")
        .insert({
          key,
          attempts: 1,
          last_attempt_at: now.toISOString(),
        });

      if (insertError) {
        console.error("Database error inserting rate limit record:", insertError.message);
      }
      return { allowed: true };
    }

    const lastAttemptAt = new Date(record.last_attempt_at);
    const timePassed = now.getTime() - lastAttemptAt.getTime();

    // If time passed exceeds window, reset the counter
    if (timePassed > WINDOW_MS) {
      const { error: updateError } = await getSupabaseAdmin()
        .from("rate_limits")
        .update({
          attempts: 1,
          last_attempt_at: now.toISOString(),
        })
        .eq("key", key);

      if (updateError) {
        console.error("Database error resetting rate limit window:", updateError.message);
      }
      return { allowed: true };
    }

    // Lockout user if attempts exceed the limit
    if (record.attempts >= MAX_ATTEMPTS) {
      // Extend the lockout window from the most recent failed attempt
      await getSupabaseAdmin()
        .from("rate_limits")
        .update({
          last_attempt_at: now.toISOString(),
        })
        .eq("key", key);

      return { allowed: false };
    }

    // Increment attempt count
    const { error: updateError } = await getSupabaseAdmin()
      .from("rate_limits")
      .update({
        attempts: record.attempts + 1,
        last_attempt_at: now.toISOString(),
      })
      .eq("key", key);

    if (updateError) {
      console.error("Database error incrementing rate limit attempts:", updateError.message);
    }

    return { allowed: true };
  } catch (err: any) {
    console.error("Rate limit verification failed:", err.message || err);
    return { allowed: true }; // Fail-open
  }
}

/**
 * Reset authentication attempt records upon a successful login.
 */
export async function resetAttempts(key: string): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin()
      .from("rate_limits")
      .delete()
      .eq("key", key);

    if (error) {
      console.error("Database error clearing rate limit history:", error.message);
    }
  } catch (err: any) {
    console.error("Failed to clear rate limit history:", err.message || err);
  }
}
