import { getPublishedMediaKeys } from "@/lib/content";
import { getObject } from "@/lib/storage";

// Serves company logos from the private "media" bucket at stable URLs
// (/media/<key>), so the bucket never has to be public and no signed URL ever
// expires in a cached page. Only keys referenced by a published experience are
// served; anything else is a 404. Responses are cached hard by browsers and the
// CDN, so storage is only asked again after a day (a week at the edge).

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

export async function GET(_request: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");

  const allowed = await getPublishedMediaKeys();
  if (!allowed.has(key)) return notFound();

  let upstream: Response | null;
  try {
    upstream = await getObject(key);
  } catch (error) {
    console.error(`[media] couldn't fetch ${key}:`, error);
    return new Response("Storage unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  if (!upstream) return new Response("Storage not configured", { status: 503, headers: { "Cache-Control": "no-store" } });
  if (upstream.status === 404) return notFound();
  if (!upstream.ok || !upstream.body) {
    console.error(`[media] storage answered ${upstream.status} for ${key}`);
    return new Response("Storage error", { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  const type = upstream.headers.get("content-type") ?? "application/octet-stream";
  if (!type.startsWith("image/")) return notFound(); // logos only

  const headers = new Headers({
    "Content-Type": type,
    "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    "X-Content-Type-Options": "nosniff",
  });
  const etag = upstream.headers.get("etag");
  if (etag) headers.set("ETag", etag);
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  // an SVG can carry script: render it as an inert image only
  if (type.includes("svg")) headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");

  return new Response(upstream.body, { status: 200, headers });
}
