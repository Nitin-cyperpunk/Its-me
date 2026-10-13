// The database client. Server-only: importing this from a client component
// fails the build, so the connection string can never reach the browser.
//
// Neon's HTTP driver: each query is one HTTPS request, with no connection pool
// to manage — the right fit for Vercel's serverless functions. It reads
// DATABASE_URL (Neon's pooled connection string), never a NEXT_PUBLIC_ variable.

import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null | undefined;

/** The shared query function, or null when DATABASE_URL isn't configured. */
export function getDb() {
  if (client === undefined) {
    const url = process.env.DATABASE_URL?.trim();
    client = url ? neon(url) : null;
    if (!url) console.warn("[db] DATABASE_URL is not set — sections use the built-in content.");
  }
  return client;
}
