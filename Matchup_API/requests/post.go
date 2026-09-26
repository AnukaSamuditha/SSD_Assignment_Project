package requests

import (
	"matchup_api/models"

	"github.com/google/uuid"
)

type Salary struct {
	Min      float64 `json:"min" binding:"required,gt=0"`
	Max      float64 `json:"max" binding:"required,gt=0"`
	Currency string  `json:"currency" binding:"required"`
}

type PostCreateRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description" binding:"required"`
	Summary     string    `json:"summary" binding:"required"`
	EmpType     string    `json:"empType" binding:"required"`
	WorkMode    string    `json:"workMode" binding:"required"`
	CompanyID   uuid.UUID `json:"companyID" binding:"required"`
	Salary      Salary    `json:"salary" binding:"required"`
}

type PostUpdateRequest struct {
	Title       *string `form:"title" json:"title" binding:"omitempty"`
	Description *string `json:"description" binding:"omitempty"`
	Status      *string `form:"status" json:"status" binding:"omitempty"`
	Summary     *string `json:"summary" binding:"omitempty"`
	EmpType     *string `json:"empType" binding:"omitempty"`
	WorkMode    *string `json:"workMode" binding:"omitempty"`
	Salary      *Salary `json:"salary" binding:"omitempty"`
}

type PostsResponse struct {
	Post           models.Post `json:"post"`
	ApplicantCount int64       `json:"applicant_count"`
}
