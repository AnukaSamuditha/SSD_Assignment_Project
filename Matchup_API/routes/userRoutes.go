package routes

import (
	"matchup_api/controllers"
	"matchup_api/middleware"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis_rate/v10"
)

func UserRoutes(router *gin.RouterGroup) {
	// SECURITY FIX: tighter than the global rate limit, specifically to slow
	// down brute-force login attempts and signup-based account/email spam.
	authRateLimit := middleware.RateLimit("auth", redis_rate.PerMinute(5))

	router.GET("/self", middleware.RequireAuth, controllers.Self)
	router.POST("/signup", authRateLimit, controllers.SignUp)
	router.POST("/login", authRateLimit, controllers.Login)
}
