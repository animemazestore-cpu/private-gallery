import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import crypto from "crypto";
import { verifyVisitorPin } from "../lib/auth/pin";
import {
  createVisitorSession,
  createAdminSession,
  getVisitorSession,
  getAdminSession,
  destroySession,
} from "../lib/auth/session";

// 1. Mock next/headers cookies store
const mockCookies: Record<string, string> = {};
const mockCookieStore = {
  set: vi.fn((name: string, value: string, _options?: any) => {
    mockCookies[name] = value;
  }),
  get: vi.fn((name: string) => {
    return mockCookies[name] ? { value: mockCookies[name] } : undefined;
  }),
  delete: vi.fn((name: string) => {
    delete mockCookies[name];
  }),
};

vi.mock("next/headers", () => {
  return {
    cookies: () => Promise.resolve(mockCookieStore),
  };
});

describe("verifyVisitorPin", () => {
  beforeAll(async () => {
    // Generate a valid PBKDF2 hash of "1234" for testing (using low iterations for test speed)
    const pin = "1234";
    const salt = crypto.randomBytes(16).toString("hex");
    const iterations = 1000;
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(pin, Buffer.from(salt, "hex"), iterations, 32, "sha256", (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    
    process.env.VISITOR_PIN_HASH = `pbkdf2$${iterations}$${salt}$${derivedKey.toString("hex")}`;
    process.env.ADMIN_AUTH_SECRET = "test-admin-secret-at-least-32-chars";
  });

  it("should succeed with correct PIN", async () => {
    const isValid = await verifyVisitorPin("1234");
    expect(isValid).toBe(true);
  });

  it("should fail with incorrect PIN", async () => {
    const isValid = await verifyVisitorPin("9999");
    expect(isValid).toBe(false);
  });

  it("should fail if environment variable is not configured", async () => {
    const originalHash = process.env.VISITOR_PIN_HASH;
    delete process.env.VISITOR_PIN_HASH;
    
    const isValid = await verifyVisitorPin("1234");
    expect(isValid).toBe(false);
    
    process.env.VISITOR_PIN_HASH = originalHash;
  });

  it("should fallback to simple check in development if hash format is plain", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalHash = process.env.VISITOR_PIN_HASH;
    
    (process.env as any).NODE_ENV = "development";
    process.env.VISITOR_PIN_HASH = "dev123";
    
    const isDevValid = await verifyVisitorPin("dev123");
    expect(isDevValid).toBe(true);
    
    const isDevInvalid = await verifyVisitorPin("wrong");
    expect(isDevInvalid).toBe(false);
    
    // Restore
    (process.env as any).NODE_ENV = originalNodeEnv;
    process.env.VISITOR_PIN_HASH = originalHash;
  });
});

describe("session cookie management", () => {
  beforeEach(() => {
    // Clear cookies mock store
    for (const key in mockCookies) {
      delete mockCookies[key];
    }
    mockCookieStore.set.mockClear();
    mockCookieStore.get.mockClear();
    mockCookieStore.delete.mockClear();
    process.env.ADMIN_AUTH_SECRET = "test-admin-secret-at-least-32-chars";
  });

  it("should create visitor session cookie correctly", async () => {
    await createVisitorSession();
    
    expect(mockCookieStore.set).toHaveBeenCalled();
    const callArgs = mockCookieStore.set.mock.calls[0];
    expect(callArgs?.[0]).toBe("pg_visitor_session");
    
    // Verify token structure (serialized.signature)
    const token = callArgs?.[1];
    expect(token).toContain(".");
    
    // Verify role inside payload is visitor
    const session = await getVisitorSession();
    expect(session).not.toBeNull();
    expect(session?.role).toBe("visitor");
  });

  it("should create admin session cookie correctly", async () => {
    await createAdminSession();
    
    expect(mockCookieStore.set).toHaveBeenCalled();
    const callArgs = mockCookieStore.set.mock.calls[0];
    expect(callArgs?.[0]).toBe("pg_admin_session");
    
    // Verify role inside payload is admin
    const session = await getAdminSession();
    expect(session).not.toBeNull();
    expect(session?.role).toBe("admin");
  });

  it("should fail to retrieve visitor session if token signature is tempered", async () => {
    await createVisitorSession();
    const validToken = mockCookies["pg_visitor_session"];
    
    // Temper signature (modify last character)
    mockCookies["pg_visitor_session"] = validToken?.substring(0, validToken.length - 1) + "X";
    
    const session = await getVisitorSession();
    expect(session).toBeNull();
  });

  it("should fail to retrieve session if expired", async () => {
    // Create manual expired session token
    const now = Math.floor(Date.now() / 1000);
    const expiredPayload = {
      role: "visitor" as const,
      iat: now - 1000,
      exp: now - 10, // expired 10s ago
    };
    
    const serialized = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const secret = process.env.ADMIN_AUTH_SECRET || "fallback";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(serialized)
      .digest("base64url");
      
    mockCookies["pg_visitor_session"] = `${serialized}.${signature}`;
    
    const session = await getVisitorSession();
    expect(session).toBeNull();
  });

  it("should destroy session cookie when log out is requested", async () => {
    await createVisitorSession();
    expect(mockCookies["pg_visitor_session"]).toBeDefined();
    
    await destroySession("visitor");
    expect(mockCookieStore.delete).toHaveBeenCalledWith("pg_visitor_session");
    expect(mockCookies["pg_visitor_session"]).toBeUndefined();
  });
});
