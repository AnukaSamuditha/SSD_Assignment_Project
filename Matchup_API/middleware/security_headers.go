package middleware

import "github.com/gin-gonic/gin"

// SecurityHeaders applies baseline security headers to every response.
//
//   - X-Content-Type-Options: fixes ZAP finding "X-Content-Type-Options Header
//     Missing" (CWE-693) — without it, older browsers may MIME-sniff response
//     bodies (e.g. on /metrics or error pages) and render them as an
//     unintended content type.
//   - Content-Security-Policy / X-Frame-Options: this API never returns HTML
//     or serves as a page to be framed, so both are locked down to deny
//     rendering/framing entirely, closing off reflected-content and
//     clickjacking vectors on any endpoint that echoes user input.
//   - Strict-Transport-Security: forces HTTPS on repeat visits once a
//     response has been received over TLS (a no-op, per spec, for a plain
//     HTTP request, so it's safe to send unconditionally here).
//   - Referrer-Policy: prevents full request URLs (which can carry tokens or
//     IDs in query strings) from leaking via the Referer header.
//   - Permissions-Policy: this API needs none of these browser features, so
//     they're disabled outright for any client that might render it.
func SecurityHeaders(c *gin.Context) {
	c.Header("X-Content-Type-Options", "nosniff")
	c.Header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
	c.Header("X-Frame-Options", "DENY")
	c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
	c.Header("Referrer-Policy", "no-referrer")
	c.Header("Permissions-Policy", "geolocation=(), camera=(), microphone=()")
	c.Next()
}
