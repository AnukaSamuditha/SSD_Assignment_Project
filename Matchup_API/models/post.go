package models

import (
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	PublicID     uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();uniqueIndex" json:"publicID"`
	Title        string         `json:"title"`
	Description  string         `json:"description"`
	Summary      string         `json:"summary"`
	EmpType      string         `json:"empType"`
	WorkMode     string         `json:"workMode"`
	CompanyID    uuid.UUID      `gorm:"type:uuid; index;" json:"companyID"`
	Author       uuid.UUID      `gorm:"type:uuid;" json:"author"`
	Status       *string        `gorm:"default:'active'" json:"status"`
	Salary       datatypes.JSON `gorm:"type:jsonb" json:"salary"`
	Company      Company        `gorm:"foreignKey:CompanyID;references:PublicID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"company"`
	SearchVector string         `gorm:"type:tsvector;->"`
	Location     string         `json:"location"`
}
