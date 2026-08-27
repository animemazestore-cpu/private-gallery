// Helper script to generate a secure PBKDF2 hash for VISITOR_PIN_HASH or admin secrets.
// Run with: node scripts/hash-pin.js <your-pin>

const crypto = require("crypto");

const pin = process.argv[2];

if (!pin) {
  console.log("Usage: node scripts/hash-pin.js <your-pin>");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const iterations = 100000;
const keyLength = 32;

crypto.pbkdf2(pin, Buffer.from(salt, "hex"), iterations, keyLength, "sha256", (err, derivedKey) => {
  if (err) {
    console.error("Error generating hash:", err);
    process.exit(1);
  }
  const hash = derivedKey.toString("hex");
  const formattedHash = `pbkdf2$${iterations}$${salt}$${hash}`;
  
  console.log("\n==================================================");
  console.log("Secure Hashed PIN generated successfully!");
  console.log("Add this line to your .env.local file:\n");
  console.log(`VISITOR_PIN_HASH=${formattedHash}`);
  console.log("==================================================\n");
});
