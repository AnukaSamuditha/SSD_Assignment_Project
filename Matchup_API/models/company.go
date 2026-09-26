package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Company struct {
	gorm.Model
	PublicID    uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();unique"`
	Name        string    `gorm:"unique"`
	Description string
	Email       string `gorm:"unique"`
	Username    string `gorm:"unique"`
	Location    string
	Logo        string
	AuthorID    uuid.UUID `gorm:"type:uuid;uniqueIndex"`
	Website     *string   `json:"website,omitempty"`
	Facebook    *string   `json:"facebook,omitempty"`
	Twitter     *string   `json:"twitter,omitempty"`
	Linkedin    *string   `json:"linkedin,omitempty"`
}
