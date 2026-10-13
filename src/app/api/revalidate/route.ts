import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";

// After editing portfolio content in the database, call this to show it on the
// next visit instead of waiting for the hourly refresh:
//
//   curl -X POST https://nitinverse.me/api/revalidate \
//        -H "Authorization: Bearer $REVALIDATE_SECRET"
//
// REVALIDATE_SECRET is a server-only env var (any long random string).

const authorized = (header: string | null) => {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
};

export async function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET?.trim()) {
    return Response.json({ ok: false, error: "REVALIDATE_SECRET is not configured" }, { status: 503 });
  }
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  // expire now: the very next visit reads fresh content (not one stale view first)
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true, revalidated: CONTENT_TAG, at: new Date().toISOString() });
}
