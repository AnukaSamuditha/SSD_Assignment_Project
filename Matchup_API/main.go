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
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func init() {
	initializers.LoadEnvs()
	initializers.ConnectDB()
	initializers.ConnectRedis()
	initializers.ConnectRabbitMQ()
}
func main() {
	f, _ := os.Create("gin.log")
	gin.DefaultWriter = io.MultiWriter(f)

	go queue.ConsumeResumeData()

	router := gin.Default()

	// Registered before any routes: gin only applies Use() middleware to
	// routes added after the call, so this must precede /metrics below.
	router.Use(middleware.SecurityHeaders)

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://matchup-frontend-iota.vercel.app", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

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
