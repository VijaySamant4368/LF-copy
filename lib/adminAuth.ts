// Minimal, stateless admin auth: one shared password (env var, never a real
// user table), a signed short-lived cookie for the session. No DB session
// store needed - fits both serverless (Vercel) and a single-admin VPS box.
// Uses Web Crypto (crypto.subtle) rather than node:crypto so the exact same
// code runs in both Edge middleware and normal Node route handlers.
const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not set (see lawsforum-web/.env.local)");
  }
  return secret;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(expires)));
  return `${expires}.${toHex(sig)}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiresStr, sigHex] = token.split(".");
  if (!expiresStr || !sigHex) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const key = await hmacKey();
  const expectedSig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expiresStr));
  return toHex(expectedSig) === sigHex;
}

// Length-revealing but not timing-critical for a single shared admin password
// checked over HTTPS - not the enterprise-auth bar, matches the "hardcoded
// password, for now" scope this was asked for.
export function checkPassword(input: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  return typeof input === "string" && !!real && input === real;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
