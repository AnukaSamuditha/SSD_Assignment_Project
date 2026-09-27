package middleware

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
)

// AllowedOrigins is the single source of truth for which frontend origins
// are trusted - shared with the CORS config in main.go so the two can never
// drift apart.
var AllowedOrigins = []string{
	"https://matchup-frontend-iota.vercel.app",
	"http://localhost:3000",
}

var unsafeMethods = []string{http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete}

// CSRFProtection blocks cross-site state-changing requests (CWE-352). The
// auth cookie is SameSite=None (required since the frontend and API live on
// different origins), so browsers attach it to cross-site requests too.
// CORS alone doesn't stop this - it only stops an attacker's page from
// *reading* the response, not from *sending* the request - and a
// multipart/form-data POST doesn't even trigger a CORS preflight. Browsers
// always attach Origin on a cross-origin request and never let page JS
// override it, so rejecting any mutating request whose Origin isn't our own
// frontend closes this off.
func CSRFProtection(c *gin.Context) {
	if !slices.Contains(unsafeMethods, c.Request.Method) {
		c.Next()
		return
	}

	origin := c.GetHeader("Origin")

	if origin == "" || !slices.Contains(AllowedOrigins, origin) {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "cross-site request blocked",
		})

		return
	}

	c.Next()
}
