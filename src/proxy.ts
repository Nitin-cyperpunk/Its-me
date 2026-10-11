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

// Only real page loads count. Next strips its own router headers (RSC,
// Next-Router-Prefetch) before the proxy runs, so they can't be checked here;
// instead use what the browser says it's fetching: a page load is a "document",
// a router/RSC fetch is "empty" and asks for text/x-component.
// (Requests without Sec-Fetch-Dest, e.g. older browsers, still count.)
function isPageLoad(h: Headers) {
  const dest = h.get("sec-fetch-dest");
  return (dest === null || dest === "document") && !h.get("accept")?.includes("text/x-component");
}

function shouldCount(request: NextRequest) {
  const h = request.headers;
  return (
    visitorCounterEnabled &&
    request.method === "GET" &&
    isPageLoad(h) &&
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
