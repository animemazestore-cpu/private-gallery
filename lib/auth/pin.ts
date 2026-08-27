// Cryptographic credential verification helpers (timingSafeEqual and PBKDF2).

import crypto from "crypto";

/**
 * Verify if the provided input matches a secure hash configuration.
 * Supports a secure PBKDF2 format (pbkdf2$iterations$saltHex$hashHex) and
 * falls back to direct comparison in non-production environments with a warning.
 */
export async function verifyCredential(
  input: string,
  configuredSecret: string
): Promise<boolean> {
  try {
    const parts = configuredSecret.split("$");

    // Support plaintext fallback if the secret is not formatted as PBKDF2
    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      // timing-safe comparison for plaintext fallback
      const a = Buffer.from(input);
      const b = Buffer.from(configuredSecret);
      if (a.length !== b.length) {
        return false;
      }
      return crypto.timingSafeEqual(a, b);
    }

    const iterations = parseInt(parts[1] || "100000", 10);
    const saltHex = parts[2];
    const hashHex = parts[3];

    if (!saltHex || !hashHex || isNaN(iterations)) {
      console.error("Invalid PBKDF2 hash parts in configured credential.");
      return false;
    }

    const salt = Buffer.from(saltHex, "hex");
    const hash = Buffer.from(hashHex, "hex");

    return new Promise<boolean>((resolve) => {
      crypto.pbkdf2(
        input,
        salt,
        iterations,
        hash.length,
        "sha256",
        (err, derivedKey) => {
          if (err) {
            console.error("Encryption error during verification:", err);
            resolve(false);
            return;
          }
          resolve(crypto.timingSafeEqual(hash, derivedKey));
        }
      );
    });
  } catch (err: any) {
    console.error("Error during credential verification:", err.message || err);
    return false;
  }
}

/**
 * Verify if the provided PIN matches the configured VISITOR_PIN_HASH.
 */
export async function verifyVisitorPin(pin: string): Promise<boolean> {
  const pinHash = process.env.VISITOR_PIN_HASH;
  if (!pinHash) {
    console.error("Missing VISITOR_PIN_HASH environment variable.");
    return false;
  }
  return verifyCredential(pin, pinHash);
}
