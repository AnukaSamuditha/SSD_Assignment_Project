package middleware

import (
	"net/http"
	"strconv"

	"matchup_api/initializers"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis_rate/v10"
)

// RateLimit fixes the "no rate limiting anywhere" finding: nothing capped
// how often a client could hit the API, leaving every endpoint open to
// brute-force/credential-stuffing and basic DoS-by-volume. Backed by Redis
// (already used for caching) rather than an in-memory counter, so the limit
// holds even if the API runs as multiple instances behind a load balancer.
//
// prefix namespaces the Redis keys so two RateLimit calls with different
// limits (e.g. a loose global one and a tight one on /users/login) never
// share - and so never fight over - the same counter.
func RateLimit(prefix string, limit redis_rate.Limit) gin.HandlerFunc {
	limiter := redis_rate.NewLimiter(initializers.Redis)

	return func(c *gin.Context) {
		key := "ratelimit:" + prefix + ":" + c.ClientIP()

		res, err := limiter.Allow(c.Request.Context(), key, limit)

		if err != nil {
			// Redis being unreachable shouldn't take the whole API down;
			// fail open and let the request through.
			c.Next()
			return
		}

		if res.Allowed == 0 {
			c.Header("Retry-After", strconv.Itoa(int(res.RetryAfter.Seconds())))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "too many requests, please try again later",
			})

			return
		}

		c.Next()
	}
}
