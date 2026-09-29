package controllers

import (
	"errors"
	"matchup_api/initializers"
	"matchup_api/middleware"
	"matchup_api/models"
	"matchup_api/queue"
	"matchup_api/requests"
	"matchup_api/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateApplication(c *gin.Context) {
	var body requests.ApplicationCreateRequest

	if err := c.ShouldBind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
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

	if !strings.HasPrefix(fileHeader.Header.Get("Content-Type"), "application/pdf") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "only pdf files are allowed",
		})

		return
	}

	defer file.Close()

	data, _ := c.Get("user")
	user := data.(models.User)

	postUUID, err := uuid.Parse(body.PostID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	type PostDes struct {
		Description string
	}

	var desResult PostDes

	queryResult := initializers.DB.Model(&models.Post{}).Select("description").Where("public_id = ?", postUUID).First(&desResult)

	if queryResult.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Invalid post id",
		})

		return
	}

	description := desResult.Description
	companyUUID, err := uuid.Parse(body.CompanyID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	info := utils.DataType{
		Type:   "application/pdf",
		UserID: user.PublicID,
		PostID: &postUUID,
	}

	fileURL, err := utils.UploadFile(utils.CLD, utils.CTX, file, info)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error occurred in uploading pdf file",
		})

		return
	}

	newApplication := models.Application{
		ApplicantID: user.PublicID,
		PostID:      postUUID,
		CompanyID:   companyUUID,
		CV:          fileURL,
	}

	result := initializers.DB.Create(&newApplication)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error creating the application",
		})

		return
	}

	queueItem := queue.ItemBody{
		PostID:         postUUID.String(),
		ApplicationID:  newApplication.PublicID.String(),
		JobDescription: description,
		ResumeURL:      fileURL,
		FileName:       fileHeader.Filename,
	}

	err = queue.PublishResume(queueItem)

	if err != nil {
		initializers.DB.Model(&models.Application{}).Where("id = ?", newApplication.ID).Update("status", "unranked")

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error publishing to queue" + err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "application created successfully",
		"application": newApplication,
	})
}

func GetPostApplications(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required information",
		})

		return
	}

	
	data, _ := c.Get("user")
	user := data.(models.User)

	var post models.Post

	if err := initializers.DB.Where("public_id = ?", id).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "post not found",
		})

		return
	}

	if post.Author != user.PublicID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "you do not have permission to view these applications",
		})

		return
	}

	var applications []models.Application

	result := initializers.DB.Preload("User").Where("post_id = ?", id).Order("applicant_id, created_at DESC").Distinct("ON (applicant_id) applications.*").Find(&applications)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error getting post applications : " + result.Error.Error(),
		})

		return
	}

	if len(applications) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message":      "No applications found",
			"applications": []models.Application{},
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"applications": applications,
	})
}

func GetApplication(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required information",
		})

		return
	}

	var application models.Application

	result := initializers.DB.Where("public_id = ?", id).Preload("User").First(&application)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error finding the application" + result.Error.Error(),
		})

		return
	}

	
	data, _ := c.Get("user")
	user := data.(models.User)

	if application.ApplicantID != user.PublicID {
		var company models.Company

		if err := initializers.DB.Where("public_id = ?", application.CompanyID).First(&company).Error; err != nil || company.AuthorID != user.PublicID {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "you do not have permission to view this application",
			})

			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"application": application,
	})
}

func UpdateApplication(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required information",
		})

		return
	}

	var body requests.ApplicationUpdateRequest

	if err := c.ShouldBind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request",
		})

		return
	}

	applicationUUID, err := uuid.Parse(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error" : "Invalid application id",
		})

		return
	}

	var application models.Application

	result := initializers.DB.Where("public_id = ?", applicationUUID).First(&application)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Application not found",
			})

			return
		} else {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error finding the application",
			})

			return
		}
	}

	
	data, _ := c.Get("user")
	user := data.(models.User)

	var company models.Company

	if err := initializers.DB.Where("public_id = ?", application.CompanyID).First(&company).Error; err != nil || company.AuthorID != user.PublicID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "you do not have permission to update this application",
		})

		return
	}

	result = initializers.DB.Model(&application).Updates(body)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error" : "Error saving the application data",
		})

		return
	}

	middleware.DeleteCache(
		"cache:/application/" + application.PublicID.String(),
	)

	c.JSON(http.StatusOK, gin.H{
		"message" : "Application updated successfully",
		"application" : application,
	})
}
