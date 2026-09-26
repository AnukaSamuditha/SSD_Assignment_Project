package routes

import (
	"matchup_api/controllers"
	"matchup_api/middleware"
	"time"

	"github.com/gin-gonic/gin"
)

func ApplicationRoutes(router *gin.RouterGroup) {
	router.GET("/post/:id", middleware.RequireAuth, controllers.GetPostApplications)
	router.GET("/:id", middleware.RequireAuth, middleware.CacheMiddleware(10*time.Minute), controllers.GetApplication)
	router.PATCH("/:id", middleware.RequireAuth, controllers.UpdateApplication)
	router.POST("/", middleware.RequireAuth, controllers.CreateApplication)

}
