package controllers

import (
	"matchup_api/initializers"
	"matchup_api/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func SignUp(c *gin.Context) {

	var body struct {
		Email     string `json:"email" binding:"required"`
		Password  string `json:"password" binding:"required"`
		Type      string `json:"type" binding:"required"`
		Gender    string `json:"gender" binding:"required"`
		Firstname string `json:"firstname" binding:"required"`
		Lastname  string `json:"lastname" binding:"required"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	// SECURITY FIX (Insecure Design): `body.Type` is the account's
	// authorization role - checked by Authorize("employer") on every
	// privileged route - and was accepted from the client with no
	// validation, letting a signup request set it to any string. Restrict it
	// to the known, self-service roles the product actually offers.
	
	// -Allow-list (not deny-list): any new role must be added here explicitly.

	if body.Type != "employer" && body.Type != "regular" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid account type",
		})

		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error" + err.Error(),
		})

		return
	}

	var avatarURL string

	if body.Gender == "male" {
		avatarURL = "https://api.dicebear.com/9.x/dylan/svg?seed=" + body.Firstname + "&gender=male"
	} else {
		avatarURL = "https://api.dicebear.com/9.x/dylan/svg?seed=" + body.Firstname + "&gender=female"
	}

	user := models.User{
		Email:     body.Email,
		Password:  string(hash),
		Type:      body.Type,
		Gender:    body.Gender,
		Firstname: body.Firstname,
		Lastname:  body.Lastname,
		Avatar:    avatarURL,
	}

	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error in creating the user",
		})

		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"ID":   user.ID,
		"exp":  time.Now().Add(time.Hour * 24 * 7).Unix(),
		"type": user.Type,
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error in creating token" + err.Error(),
		})

		return
	}

	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", true, true)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User is created successfully",
		"user":    user,
	})

}

func Login(c *gin.Context) {

	var body struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	var user models.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Invalid email or password",
		})

		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid email or password",
		})

		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"ID":   user.ID,
		"exp":  time.Now().Add(time.Hour * 24 * 7).Unix(),
		"type": user.Type,
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error in creating token" + err.Error(),
		})

		return
	}

	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", true, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully logged in.",
		"user":    user,
	})

}

func Self(c *gin.Context) {
	data, exists := c.Get("user")

	if !exists {
		c.AbortWithStatus(http.StatusUnauthorized)
	}

	user, ok := data.(models.User)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Type assertion failed",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})

}

