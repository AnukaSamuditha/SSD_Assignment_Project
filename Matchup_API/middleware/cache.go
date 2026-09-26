package middleware

import (
	"matchup_api/initializers"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type responseWriter struct {
	gin.ResponseWriter
	body []byte
}

func CacheMiddleware(ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {

		if c.Request.Method != http.MethodGet {
			c.Next()
			return
		}

		key := "cache:" + c.Request.URL.RequestURI()

		val, err := initializers.Redis.Get(initializers.Ctx, key).Result()

		if err == nil {
			c.Data(http.StatusOK, "application/json", []byte(val))
			c.Abort()

			return
		}

		writer := &responseWriter{
			ResponseWriter: c.Writer,
			body:           []byte{},
		}

		c.Writer = writer

		c.Next()

		if c.Writer.Status() == http.StatusOK {
			initializers.Redis.Set(
				initializers.Ctx,
				key,
				writer.body,
				ttl,
			)
		}
	}
}

func (w *responseWriter) Write(b []byte) (int, error) {
	w.body = append(w.body, b...)
	return w.ResponseWriter.Write(b)
}

func DeleteCache(patterns ...string) error {

	for _, pattern := range patterns {

		iter := initializers.Redis.Scan(initializers.Ctx, 0, pattern, 0).Iterator()

		for iter.Next(initializers.Ctx) {
			key := iter.Val()

			if err := initializers.Redis.Del(initializers.Ctx, key).Err(); err != nil {
				return err
			}
		}

		if err := iter.Err(); err != nil {
			return err
		}
	}

	return nil
}
