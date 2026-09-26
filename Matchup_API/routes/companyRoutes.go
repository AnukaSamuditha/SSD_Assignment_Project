package routes

import (
	"matchup_api/controllers"
	"matchup_api/middleware"
	"time"

	"github.com/gin-gonic/gin"
)

func CompanyRoutes(router *gin.RouterGroup) {
	router.POST("/", middleware.RequireAuth, middleware.Authorize("employer"), controllers.CreateCompany)
	router.GET("/:id", middleware.RequireAuth, middleware.CacheMiddleware(10*time.Minute), controllers.GetCompany)
	router.GET("/:id/exists", middleware.RequireAuth, middleware.Authorize("employer"), middleware.CacheMiddleware(10*time.Minute), controllers.GetUserCompany)
	router.PATCH("/:id", middleware.RequireAuth, middleware.Authorize("employer"), controllers.UpdateCompany)
}
