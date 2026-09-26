package routes

import (
	"matchup_api/controllers"
	"matchup_api/middleware"

	"github.com/gin-gonic/gin"
)

func UserRoutes(router *gin.RouterGroup) {
	router.GET("/self", middleware.RequireAuth, controllers.Self)
	router.POST("/signup", controllers.SignUp)
	router.POST("/login", controllers.Login)
}
