package models

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Application struct {
	gorm.Model
	PublicID     uuid.UUID       `gorm:"type:uuid;default:uuid_generate_v4();uniqueIndex" json:"publicID"`
	ApplicantID  uuid.UUID       `gorm:"type:uuid;" json:"applicantID"`
	PostID       uuid.UUID       `gorm:"type:uuid; index" json:"postID"`
	CompanyID    uuid.UUID       `gorm:"type:uuid" json:"companyID"`
	Status       string          `gorm:"default:'active'" json:"status"`
	User         User            `gorm:"foreignKey:ApplicantID;references:PublicID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user"`
	Post         Post            `gorm:"foreignKey:PostID;references:PublicID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"post"`
	Company      Company         `gorm:"foreignKey:CompanyID;references:PublicID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"company"`
	CV           string          `json:"cv"`
	RatingData   *datatypes.JSON `gorm:"type:jsonb" json:"rating_data" binding:"omitempty"`
}
