// POST /api/auth/unlock — docs/API.md, docs/AUTH.md
// Body: { pin: string }
// 1. Rate-limit check (lib/auth/rateLimit.ts) keyed by IP.
// 2. Verify PIN via lib/auth/pin.ts (hash comparison, never plaintext).
// 3. On success: lib/auth/session.ts createVisitorSession(), 200.
// 4. On failure: generic 401 — do not reveal whether the PIN was correct or close.

import { type NextRequest, NextResponse } from "next/server";
import { verifyVisitorPin } from "@/lib/auth/pin";
import { checkAndRecordAttempt, resetAttempts } from "@/lib/auth/rateLimit";
import { createVisitorSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 2. Check rate limit
    const rateLimit = await checkAndRecordAttempt(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // 3. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const { pin } = body;
    if (typeof pin !== "string" || !pin) {
      return NextResponse.json(
        { error: "PIN is required." },
        { status: 400 }
      );
    }

    // 4. Verify PIN
    const isValid = await verifyVisitorPin(pin);

    if (isValid) {
      // Clear rate limit record on successful unlock
      await resetAttempts(ip);
      // Create session cookie
      await createVisitorSession();

      return NextResponse.json(
        { success: true },
        { status: 200 }
      );
    }

    // Generic error response on failure
    return NextResponse.json(
      { error: "Invalid PIN." },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("Unlock API handler failed:", err.message || err);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
