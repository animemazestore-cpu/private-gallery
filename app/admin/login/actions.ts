"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { checkAndRecordAttempt, resetAttempts } from "@/lib/auth/rateLimit";
import { createAdminSession } from "@/lib/auth/session";

/**
 * Server Action for admin login authentication.
 * Compares credentials using timingSafeEqual, increments rate limit on fail, and sets cookie.
 */
export async function adminLoginAction(
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 1. Check rate limiting keyed by IP
    const rateLimit = await checkAndRecordAttempt(ip);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: "Too many failed attempts. Please try again in 15 minutes.",
      };
    }

    const secret = process.env.ADMIN_AUTH_SECRET;
    if (!secret) {
      console.error("ADMIN_AUTH_SECRET environment variable is missing.");
      return {
        success: false,
        error: "Admin authentication is currently misconfigured.",
      };
    }

    // 2. Timing-safe password verification
    const inputBuffer = Buffer.from(password);
    const secretBuffer = Buffer.from(secret);

    let isValid = false;
    if (inputBuffer.length === secretBuffer.length) {
      isValid = crypto.timingSafeEqual(inputBuffer, secretBuffer);
    }

    if (isValid) {
      // Success: clear rate limit history
      await resetAttempts(ip);
      // Success: set admin session cookie
      await createAdminSession();
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid admin credentials.",
    };
  } catch (err: any) {
    console.error("Admin login action error:", err.message || err);
    return {
      success: false,
      error: "An internal server error occurred.",
    };
  }
}

/**
 * Server Action to log out the administrator by destroying their session cookie.
 */
export async function adminLogoutAction(): Promise<void> {
  const { destroySession } = await import("@/lib/auth/session");
  await destroySession("admin");
}
