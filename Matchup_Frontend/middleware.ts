import { NextRequest, NextResponse } from "next/server";

// SECURITY FIX (ZAP: Content Security Policy (CSP) Header Not Set,
// CWE-693): no response carried a CSP at all. Uses Next.js's documented
// nonce + 'strict-dynamic' pattern: a fresh nonce is generated per request,
// Next automatically applies it to the inline scripts it injects for
// hydration, and 'strict-dynamic' lets those scripts load the rest of the
// app's own JS chunks without needing to allowlist script hosts by name.
const API_ORIGIN = process.env.NEXT_PUBLIC_SERVER ?? "";
const SENTRY_ORIGIN = "https://o4510622048976896.ingest.us.sentry.io";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self' data:;
    connect-src 'self' ${API_ORIGIN} ${SENTRY_ORIGIN};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
