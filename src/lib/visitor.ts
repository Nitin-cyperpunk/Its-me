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

// Only the live site touches the real count. NODE_ENV alone can't tell:
// Vercel preview deployments are "production" too and would inflate it.
// VERCEL_ENV is set on Vercel deployments; without it (self-hosting, or system
// env vars switched off) NODE_ENV decides, as before.
const deployment = process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development");
const COUNTER_KEY =
  deployment === "production"
    ? "portfolio:visitors"
    : deployment === "preview"
      ? "portfolio:visitors:preview"
      : "portfolio:visitors:dev";

// Values pasted into a dashboard often carry a stray space or newline, which
// silently breaks the URL or the token — so trim. Both naming conventions work:
// UPSTASH_REDIS_REST_* (Upstash) and KV_REST_API_* (Vercel's Upstash integration).
const read = (...names: string[]) => names.map((n) => process.env[n]?.trim()).find(Boolean);
const url = read("UPSTASH_REDIS_REST_URL", "KV_REST_API_URL");
const token = read("UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_TOKEN");
const secret = read("VISITOR_COOKIE_SECRET");

// Why the counter is off, by variable name only — never a value.
function configProblem() {
  const missing = [
    !url && "UPSTASH_REDIS_REST_URL (or KV_REST_API_URL)",
    !token && "UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_TOKEN)",
    !secret && "VISITOR_COOKIE_SECRET",
  ].filter(Boolean);
  if (missing.length) return `missing ${missing.join(", ")}`;
  if (!/^https:\/\//i.test(url!))
    return "the Redis URL must be the REST URL (https://…upstash.io), not a redis:// or rediss:// connection string";
  if (secret!.length < 32) return `VISITOR_COOKIE_SECRET is ${secret!.length} characters; it needs at least 32`;
  return null;
}
const problem = configProblem();

/** Without a working configuration the footer just shows its neutral fallback. */
export const visitorCounterEnabled = problem === null;

// Logged once per server start, so it shows up in the deployment's logs.
if (problem) console.warn(`[visitor] counter disabled (${deployment}): ${problem}`);

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
