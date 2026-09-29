// Anonymous visitor counter, used only by src/proxy.ts (server-side).
//
// Privacy: Redis stores a single integer. The visitor's own number lives in an
// HttpOnly cookie, HMAC-signed so it can't be edited to claim another number.
// No IPs, user agents or fingerprints are stored.

import { Redis } from "@upstash/redis";

export const VISITOR_COOKIE = "portfolio_visitor";
/** Request header the proxy uses to hand the verified number to the render. */
export const VISITOR_HEADER = "x-portfolio-visitor";
/** How long a browser keeps its number (the "visitor period"). */
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

// Development never touches the real count.
const COUNTER_KEY =
  process.env.NODE_ENV === "production"
    ? "portfolio:visitors"
    : "portfolio:visitors:dev";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const secret = process.env.VISITOR_COOKIE_SECRET;

/** Without credentials the footer just shows its neutral fallback. */
export const visitorCounterEnabled = Boolean(
  url && token && secret && secret.length >= 32,
);

// One retry at most: this runs before the page renders, so fail fast.
const redis = visitorCounterEnabled
  ? new Redis({ url, token, retry: { retries: 1, backoff: () => 100 } })
  : null;

/**
 * Assigns the next visitor number. INCR is atomic in Redis, so concurrent
 * visitors always get distinct numbers — no read-then-write race.
 */
export async function assignVisitorNumber(): Promise<number> {
  if (!redis) throw new Error("Visitor counter is not configured");
  return redis.incr(COUNTER_KEY);
}

// ---------- signed cookie: "<number>.<base64url HMAC-SHA256>" ----------

let hmacKey: Promise<CryptoKey> | undefined;
const getKey = () =>
  (hmacKey ??= crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  ));

const toBase64Url = (bytes: ArrayBuffer) =>
  Buffer.from(bytes).toString("base64url");

export async function signVisitorNumber(n: number): Promise<string> {
  const sig = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    new TextEncoder().encode(String(n)),
  );
  return `${n}.${toBase64Url(sig)}`;
}

/** Returns the number from a valid cookie, or null if missing/tampered. */
export async function readVisitorCookie(
  value: string | undefined,
): Promise<number | null> {
  if (!value || !visitorCounterEnabled) return null;
  const [raw, sig] = value.split(".");
  const n = Number(raw);
  if (!sig || !Number.isSafeInteger(n) || n < 1 || String(n) !== raw) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await getKey(),
    Buffer.from(sig, "base64url"),
    new TextEncoder().encode(raw),
  );
  return valid ? n : null;
}
