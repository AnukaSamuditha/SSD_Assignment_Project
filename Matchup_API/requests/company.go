package requests

type CompanyCreateRequest struct {
	Name        string  `form:"name" binding:"required"`
	Description string  `form:"description" binding:"required"`
	Email       string  `form:"email" binding:"required"`
	Username    string  `form:"username" binding:"required"`
	Location    string  `form:"location" binding:"required"`
	Website     *string `form:"website,omitempty,url"`
	Facebook    *string `form:"facebook,omitempty,url"`
	Twitter     *string `form:"twitter,omitempty,url"`
	Linkedin    *string `form:"linkedin,omitempty,url"`
}

type CompanyUpdateRequest struct {
	Name        *string `form:"name" json:"name" binding:"omitempty"`
	Description *string `form:"description" json:"description" binding:"omitempty"`
	Email       *string `form:"email" json:"email" binding:"omitempty"`
	Username    *string `form:"username" json:"username" binding:"omitempty"`
	Location    *string `form:"location" json:"location" binding:"omitempty"`
	Website     *string `form:"website" json:"website" binding:"omitempty,url"`
	Facebook    *string `form:"facebook" json:"facebook" binding:"omitempty,url"`
	Twitter     *string `form:"twitter" json:"twitter" binding:"omitempty,url"`
	Linkedin    *string `form:"linkedin" json:"linkedin" binding:"omitempty,url"`
}

type CompanyLogo struct {
	Logo           string `gorm:"column:logo"`
	CompanyName    string `gorm:"column:name"`
	CompanyAddress string `gorm:"column:location"`
}
