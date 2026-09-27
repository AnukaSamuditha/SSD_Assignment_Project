package main

import (
	"io"
	"matchup_api/initializers"
	"matchup_api/middleware"
	"matchup_api/queue"
	"matchup_api/routes"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis_rate/v10"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func init() {
	initializers.LoadEnvs()
	initializers.ConnectDB()
	initializers.ConnectRedis()
	initializers.ConnectRabbitMQ()
	initializers.ConnectGoogleOAuth()
}
func main() {
	f, _ := os.Create("gin.log")
	gin.DefaultWriter = io.MultiWriter(f)

	go queue.ConsumeResumeData()

	router := gin.Default()

	// c.ClientIP() otherwise trusts X-Forwarded-For from anyone by default
	// (Gin's own documented "unsafe" default), letting a client spoof its
	// apparent IP and dodge the per-IP rate limiting below entirely. If this
	// API sits behind a reverse proxy/load balancer that sets X-Forwarded-For
	// correctly, that proxy's IP/CIDR needs to be passed here instead of nil
	// for ClientIP() to see the real client rather than the proxy's address.
	router.SetTrustedProxies(nil)

	// Registered before any routes: gin only applies Use() middleware to
	// routes added after the call, so this must precede /metrics below.
	router.Use(middleware.SecurityHeaders)

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     middleware.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// SECURITY FIX (CSRF, CWE-352): see middleware/csrf.go - blocks
	// state-changing requests whose Origin isn't our own frontend.
	router.Use(middleware.CSRFProtection)

	// SECURITY FIX: no endpoint had any rate limiting. Applies a generous
	// per-IP cap across the whole API; auth/routes/userRoutes.go layers a
	// much tighter one on login/signup specifically to slow brute-force and
	// credential stuffing.
	router.Use(middleware.RateLimit("global", redis_rate.PerMinute(100)))

	userGroup := router.Group("/users")
	postGroup := router.Group("/posts")
	companyGroup := router.Group("/company")
	applicationGroup := router.Group("/application")

	routes.UserRoutes(userGroup)
	routes.PostRoutes(postGroup)
	routes.CompanyRoutes(companyGroup)
	routes.ApplicationRoutes(applicationGroup)
	router.Run()
}
