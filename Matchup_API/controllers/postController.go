package controllers

import (
	"encoding/json"
	"errors"
	"matchup_api/initializers"
	"matchup_api/middleware"
	"matchup_api/models"
	"matchup_api/requests"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreatePost(c *gin.Context) {

	var body requests.PostCreateRequest

	if c.ShouldBindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Request",
		})

		return
	}

	data, _ := c.Get("user")
	user := data.(models.User)

	if body.Salary.Min > body.Salary.Max {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "min salary cannot be greater than max salary",
		})

		return
	}

	companyUUID, err := uuid.Parse(body.CompanyID.String())

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid company ID",
		})

		return
	}

	var company models.Company
	result := initializers.DB.Where("public_id = ?", companyUUID).First(&company)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch company data" + result.Error.Error(),
		})

		return
	}

	salaryJSON, err := json.Marshal(body.Salary)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to process salary field",
		})

		return
	}

	post := models.Post{
		Title:       body.Title,
		Description: body.Description,
		Summary:     body.Summary,
		WorkMode:    body.WorkMode,
		EmpType:     body.EmpType,
		Author:      user.PublicID,
		CompanyID:   companyUUID,
		Salary:      salaryJSON,
		Location:    company.Location,
	}

	result = initializers.DB.Create(&post)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error in creating the post",
		})

		return
	}

	middleware.DeleteCache(
		"cache:/posts/company/posts/"+post.CompanyID.String(),
		"cache:/posts/all/*",
	)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Post is created successfully",
		"post":    post,
	})
}

func UpdatePost(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required information",
		})

		return
	}

	var body requests.PostUpdateRequest

	if err := c.ShouldBind(&body); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Request",
		})

		return
	}

	postUUID, err := uuid.Parse(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid post id",
		})

		return
	}

	var post models.Post

	result := initializers.DB.Where("public_id = ?", postUUID).First(&post)

	if result.Error != nil {

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Post not found",
			})

			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error finding the post",
			})

			return
		}
	}

	salaryJSON, err := json.Marshal(body.Salary)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid salary structure",
		})

		return
	}

	if body.Title != nil {
		post.Title = *body.Title
	}

	if body.Description != nil {
		post.Description = *body.Description
	}

	if body.Summary != nil {
		post.Summary = *body.Summary
	}

	if body.EmpType != nil {
		post.EmpType = *body.EmpType
	}

	if body.WorkMode != nil {
		post.WorkMode = *body.WorkMode
	}

	if body.Salary != nil {
		post.Salary = salaryJSON
	}

	if body.Status != nil {
		post.Status = body.Status
	}

	saveErr := initializers.DB.Save(&post)

	if saveErr.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error occurred while updating the post" + saveErr.Error.Error(),
		})

		return
	}

	middleware.DeleteCache(
		"cache:/posts/"+post.PublicID.String(),
		"cache:/posts/company/posts/"+post.CompanyID.String(),
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Post updated successfully",
		"post":    post,
	})

}

func GetPost(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Post id required",
		})

		return
	}

	var post models.Post

	result := initializers.DB.Preload("Company", nil).First(&post, "public_id = ?", id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Invalid post id",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"post": post,
	})

}

func GetAllPosts(c *gin.Context) {

	param := c.Param("page")

	if param == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing required parameter",
		})

		return
	}

	q := c.Query("q")
	empType := c.Query("empType")
	workMode := c.Query("workMode")
	minSalaryStr := c.Query("minSalary")
	maxSalaryStr := c.Query("maxSalary")
	currency := c.Query("currency")
	createdAt := c.Query("createdAt")

	query := initializers.DB.Model(&models.Post{})

	if q != "" {
		// SECURITY FIX (ZAP: SQL Injection, CWE-89): `q` was fed straight into
		// to_tsquery(), which parses its argument as a tsquery *expression*
		// (its own mini query language with &, |, !, :, parentheses, quotes),
		// not plain text. That let user input inject tsquery syntax, breaking
		// the query (e.g. a bare ') or altering search logic. plainto_tsquery
		// treats the input strictly as plain-text search terms, so it can no
		// longer be interpreted as query syntax.
		query = query.Where(
			"search_vector @@ plainto_tsquery('english', ?)",
			q,
		).Order(
			gorm.Expr(
				"ts_rank_cd(search_vector, plainto_tsquery('english', ?)) DESC",
				q,
			),
		)
	} else {
		query = query.Order("created_at DESC")
	}

	if empType != "" {
		query = query.Where("emp_type = ?", empType)
	}

	if workMode != "" {
		query = query.Where("work_mode = ?", workMode)
	}

	if minSalaryStr != "" {
		if minSalary, err := strconv.ParseFloat(minSalaryStr, 64); err == nil && minSalary > 0 {
			query = query.Where("(salary->>'min')::numeric >= ?", minSalary)
		}
	}

	if maxSalaryStr != "" {
		if maxSalary, err := strconv.ParseFloat(maxSalaryStr, 64); err == nil && maxSalary > 0 {
			query = query.Where("(salary->>'max')::numeric <= ?", maxSalary)
		}
	}

	if currency != "" {
		query = query.Where(
			"(salary->>'currency')::text = ?",
			currency,
		)
	}

	if createdAt != "" && createdAt != "anytime" {
		var fromTime time.Time

		switch createdAt {
		case "24-hours":
			fromTime = time.Now().Add(-24 * time.Hour)
		case "7-days":
			fromTime = time.Now().Add(-7 * 24 * time.Hour)
		case "30-days":
			fromTime = time.Now().Add(-30 * 24 * time.Hour)
		}

		if !fromTime.IsZero() {
			query = query.Where("created_at >= ?", fromTime)
		}
	}

	var totalCount int64
	if err := query.Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error counting total posts : " + err.Error(),
		})

		return
	}

	totalPages := int(math.Ceil(float64(totalCount) / float64(10)))

	page, _ := strconv.Atoi(param)

	if page <= 0 {
		page = 1
	}

	offset := (page - 1) * 10

	var posts []models.Post

	result := query.Offset(offset).Limit(10).Preload("Company", nil).Where("status = ?", "active").Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "error finding posts" + result.Error.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"meta": gin.H{
			"page":       page,
			"totalPages": totalPages,
		},
	})

}

func GetCompanyPosts(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required information",
		})

		return
	}

	var posts []models.Post

	companyUUID, err := uuid.Parse(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Error parsing company id : " + err.Error(),
		})

		return
	}

	result := initializers.DB.Where("company_id = ?", companyUUID).Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error finding company posts!" + result.Error.Error(),
		})

		return
	}

	if len(posts) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"messsage": "No posts found!",
			"posts":    []models.Post{},
		})

		return
	}

	var postIDs []uuid.UUID

	for _, post := range posts {
		postIDs = append(postIDs, post.PublicID)
	}

	type ApplicantsCount struct {
		PostID uuid.UUID `json:"post_id"`
		Count  int64     `json:"count"`
	}

	countMap := make(map[uuid.UUID]int64)

	var applicantsCount []ApplicantsCount
	result = initializers.DB.Model(&models.Application{}).Select("post_id", "COUNT(*) as count").Where("post_id IN ?", postIDs).Group("post_id").Scan(&applicantsCount)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error getting applicant count per post",
		})

		return
	}

	for _, item := range applicantsCount {
		countMap[item.PostID] = item.Count
	}

	var response []requests.PostsResponse

	for _, post := range posts {
		response = append(response, requests.PostsResponse{
			Post:           post,
			ApplicantCount: countMap[post.PublicID],
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": response,
	})
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required information",
		})

		return
	}

	postUUID, err := uuid.Parse(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid post id",
		})

		return
	}

	result := initializers.DB.Where("public_id = ?", postUUID).Delete(&models.Post{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error in deleting the job post",
		})

		return
	}

	middleware.DeleteCache(
		"cache:/posts/"+postUUID.String(),
		"cache:/posts/all/*",
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Job post deleted successfully",
	})
}
