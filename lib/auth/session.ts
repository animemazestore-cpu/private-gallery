// Session issuance/verification for both visitor and admin roles.
// Per docs/AUTH.md: separate visitor vs admin sessions — admin must NOT be
// inferred from a successful visitor PIN (see docs/DECISIONS.md ADR-003).
// Cookies must be Secure, HttpOnly, SameSite, with a reasonable expiry
// (docs/SECURITY.md > Authentication).

import crypto from "crypto";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

export type SessionRole = "visitor" | "admin";

export interface SessionPayload {
  role: SessionRole;
  iat: number;
  exp: number;
}

const VISITOR_COOKIE_NAME = "pg_visitor_session";
const ADMIN_COOKIE_NAME = "pg_admin_session";

// Session expirations (in seconds)
const VISITOR_SESSION_DURATION = 30 * 60; // 30 minutes
const ADMIN_SESSION_DURATION = 15 * 60;   // 15 minutes

function getSecret(): string {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_AUTH_SECRET environment variable must be set in production.");
    }
    // Ephemeral fallback key for development ease
    return "dev-fallback-secret-at-least-32-characters-long";
  }
  return secret;
}

/**
 * Sign a session payload using HMAC-SHA256.
 */
function signToken(payload: SessionPayload): string {
  const secret = getSecret();
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(serialized)
    .digest("base64url");
  return `${serialized}.${signature}`;
}

/**
 * Verify and decode a session token. Returns null if invalid or expired.
 */
function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [serialized, signature] = parts;
    if (!serialized || !signature) return null;

    const secret = getSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(serialized)
      .digest("base64url");

    // Timing-safe signature check
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(serialized, "base64url").toString("utf8")
    );

    if (!decoded || typeof decoded !== "object") return null;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return null;
    }

    return decoded as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set a signed visitor session cookie.
 */
export async function createVisitorSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "visitor",
    iat: now,
    exp: now + VISITOR_SESSION_DURATION,
  };
  const token = signToken(payload);
  const cookieStore = await cookies();
  
  cookieStore.set(VISITOR_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Omit maxAge so the cookie is a transient session cookie deleted when browser session ends
  });

  return token;
}

/**
 * Set a signed admin session cookie.
 */
export async function createAdminSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "admin",
    iat: now,
    exp: now + ADMIN_SESSION_DURATION,
  };
  const token = signToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Omit maxAge so the cookie is a transient session cookie deleted when browser session ends
  });

  return token;
}

/**
 * Get visitor session payload, if valid.
 */
export async function getVisitorSession(
  req?: NextRequest
): Promise<SessionPayload | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(VISITOR_COOKIE_NAME)?.value;
  }

  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.role === "visitor" ? payload : null;
}

/**
 * Get admin session payload, if valid.
 */
export async function getAdminSession(
  req?: NextRequest
): Promise<SessionPayload | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  }

  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.role === "admin" ? payload : null;
}

/**
 * Destroy a session cookie by role.
 */
export async function destroySession(
  role: SessionRole
): Promise<string> {
  const cookieStore = await cookies();
  const cookieName = role === "visitor" ? VISITOR_COOKIE_NAME : ADMIN_COOKIE_NAME;
  cookieStore.delete(cookieName);
  return "";
}
