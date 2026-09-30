package middleware

import (
	"matchup_api/initializers"
	"matchup_api/models"
	"net/http"
	"os"
	"slices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(c *gin.Context) {

	tokenString, err := c.Cookie("Authorization")

	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)

		return
	}
	// Accept only HS256 tokens verified with the server's secret.
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {

		return []byte(os.Getenv("SECRET")), nil

	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	// SECURITY FIX: this parse error was previously discarded, so a token with
	// an invalid or forged signature still had its (attacker-controlled)
	// claims trusted below - a full authentication bypass. Reject any token
	// that failed parsing or signature verification before touching claims.
	if err != nil || token == nil || !token.Valid {
		c.AbortWithStatus(http.StatusUnauthorized)

		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {

		if float64(time.Now().Unix()) > claims["exp"].(float64) {
			c.AbortWithStatus(http.StatusUnauthorized)
			
			return
		}

		var user models.User
		initializers.DB.First(&user, claims["ID"])

		if user.ID == 0 {
			c.AbortWithStatus(http.StatusUnauthorized)

			return
		}

		c.Set("user", user)
		c.Next()

	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
	}
}

func Authorize(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {

		userData, exists := c.Get("user")

		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error" : "Unauthorized request!",
			})

			return
		}

		user := userData.(models.User)

		if slices.Contains(roles, user.Type) {
			c.Next()
			return
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error" : "Access denied!",
		})
		
	}
}
