package routes

import (
	"matchup_api/controllers"
	"matchup_api/middleware"
	"time"

	"github.com/gin-gonic/gin"
)

func PostRoutes(router *gin.RouterGroup) {
	router.GET("/all/:page", middleware.CacheMiddleware(10*time.Minute), controllers.GetAllPosts)
	router.GET("/company/posts/:id", middleware.RequireAuth, middleware.CacheMiddleware(10*time.Minute), controllers.GetCompanyPosts)
	router.POST("/", middleware.RequireAuth, middleware.Authorize("employer"), controllers.CreatePost)
	router.GET("/:id", middleware.CacheMiddleware(10*time.Minute), controllers.GetPost)
	router.PATCH("/:id", middleware.RequireAuth, middleware.Authorize("employer"), controllers.UpdatePost)
	router.DELETE("/:id", middleware.RequireAuth, middleware.Authorize("employer"), controllers.DeletePost)
}
