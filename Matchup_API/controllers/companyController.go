package controllers

import (
	"errors"
	"matchup_api/initializers"
	"matchup_api/middleware"
	"matchup_api/models"
	"matchup_api/requests"
	"matchup_api/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateCompany(c *gin.Context) {

	var body requests.CompanyCreateRequest

	if err := c.ShouldBind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	data, _ := c.Get("user")
	user := data.(models.User)

	var company models.Company

	result := initializers.DB.Where("author_id = ?", user.PublicID).First(&company)

	if result.Error != nil {

		if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "error finding existing companies!",
			})

			return
		}

	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "account already has a company!",
		})

		return
	}

	file, fileHeader, err := c.Request.FormFile("file")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file is required",
		})

		return
	}

	if !strings.HasPrefix(fileHeader.Header.Get("Content-Type"), "image/") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only image files are allowed",
		})

		return
	}

	defer file.Close()

	info := utils.DataType{
		Type:   "image",
		UserID: user.PublicID,
	}

	fileURL, err := utils.UploadFile(utils.CLD, utils.CTX, file, info)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file upload failed",
		})

		return
	}

	newCompany := models.Company{
		Name:        body.Name,
		Description: body.Description,
		Email:       body.Email,
		Username:    body.Username,
		Location:    body.Location,
		Website:     body.Website,
		Facebook:    body.Facebook,
		Twitter:     body.Twitter,
		Linkedin:    body.Linkedin,
		AuthorID:    user.PublicID,
		Logo:        fileURL,
	}

	result = initializers.DB.Create(&newCompany)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error in creating the company",
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "company is created successfully",
		"company": newCompany,
	})

}

func GetCompany(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Company id required",
		})

		return
	}

	var company models.Company

	result := initializers.DB.Where("public_id = ?", id).First(&company)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "company not found!",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"company": company,
	})

}

func GetUserCompany(c *gin.Context) {
	userID := c.Param("id")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User id not found",
		})

		return
	}

	var company models.Company

	result := initializers.DB.Where("author_id = ?", userID).First(&company)

	// Handle in here to check whether GORM rows not found error or not
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "company not found",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"company": company,
	})
}

func UpdateCompany(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "company id not found",
		})

		return
	}

	var body requests.CompanyUpdateRequest

	if err := c.ShouldBind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request" + err.Error(),
		})

		return
	}

	var company models.Company

	result := initializers.DB.Where("public_id = ?", id).First(&company)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "company not found" + result.Error.Error(),
		})

		return
	}

	data, _ := c.Get("user")
	user := data.(models.User)

	
	if company.AuthorID != user.PublicID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "you do not have permission to update this company",
		})

		return
	}

	file, fileHeader, error := c.Request.FormFile("file")

	if file != nil && error == nil {

		if !strings.HasPrefix(fileHeader.Header.Get("Content-Type"), "image/") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Only image files are allowed",
			})

			return
		}

		defer file.Close()

		info := utils.DataType{
			Type:   "image",
			UserID: user.PublicID,
		}

		url, err := utils.UploadFile(utils.CLD, utils.CTX, file, info)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "error occurred in uploading profile picture" + err.Error(),
			})

			return
		}

		company.Logo = url

	}

	if body.Name != nil {
		company.Name = *body.Name
	}

	if body.Description != nil {
		company.Description = *body.Description
	}

	if body.Email != nil {
		company.Email = *body.Email
	}

	if body.Username != nil {
		company.Username = *body.Username
	}

	if body.Location != nil {
		company.Location = *body.Location
	}

	if body.Website != nil {
		company.Website = body.Website
	}

	if body.Linkedin != nil {
		company.Linkedin = body.Linkedin
	}

	if body.Facebook != nil {
		company.Facebook = body.Facebook
	}

	saveResult := initializers.DB.Save(&company)

	if saveResult.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error occurred while updating the company details" + saveResult.Error.Error(),
		})

		return
	}

	middleware.DeleteCache(
		"cache:/company/"+id,
		"cache:/company/"+company.AuthorID.String()+"*",
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "company is updated successfully",
		"company": company,
	})

}
