package requests

type ApplicationCreateRequest struct {
	PostID    string `form:"postID" json:"postID" binding:"required"`
	CompanyID string `form:"companyID" json:"companyID" binding:"required"`
}

type ApplicationUpdateRequest struct {
	Status string `form:"status" json:"status" binding:"required"`
}
