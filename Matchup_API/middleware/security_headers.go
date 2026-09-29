package middleware

import "github.com/gin-gonic/gin"


func SecurityHeaders(c *gin.Context) {
	c.Header("X-Content-Type-Options", "nosniff")
	c.Header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
	c.Header("X-Frame-Options", "DENY")
	c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
	c.Header("Referrer-Policy", "no-referrer")
	c.Header("Permissions-Policy", "geolocation=(), camera=(), microphone=()")
	c.Next()
}
