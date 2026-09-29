import { NextResponse, type NextRequest } from "next/server";
import {
  VISITOR_COOKIE,
  VISITOR_HEADER,
  VISITOR_MAX_AGE,
  assignVisitorNumber,
  readVisitorCookie,
  signVisitorNumber,
  visitorCounterEnabled,
} from "@/lib/visitor";

// Crawlers and link-preview bots don't keep cookies, so they'd be counted on
// every hit. Not a security boundary — just keeps the count honest.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

function shouldCount(request: NextRequest) {
  const h = request.headers;
  return (
    visitorCounterEnabled &&
    request.method === "GET" &&
    !h.has("next-router-prefetch") &&
    h.get("purpose") !== "prefetch" &&
    !h.get("sec-purpose")?.includes("prefetch") &&
    !BOT.test(h.get("user-agent") ?? "")
  );
}

// Counts each browser once, then hands the verified number to the render.
// Server Components can't set cookies, which is why this lives here.
export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete(VISITOR_HEADER); // never trust a client-supplied value

  let visitor = await readVisitorCookie(request.cookies.get(VISITOR_COOKIE)?.value);
  let cookie: string | undefined;

  if (visitor === null && shouldCount(request)) {
    try {
      visitor = await assignVisitorNumber();
      cookie = await signVisitorNumber(visitor);
    } catch (error) {
      // the footer falls back to a neutral message; the page still renders
      console.error("[visitor] counter unavailable:", error);
    }
  }

  if (visitor !== null) headers.set(VISITOR_HEADER, String(visitor));
  const response = NextResponse.next({ request: { headers } });

  if (cookie) {
    response.cookies.set(VISITOR_COOKIE, cookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_MAX_AGE,
    });
  }
  return response;
}

// Only the page that shows the footer.
export const config = { matcher: "/" };
