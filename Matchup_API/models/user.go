package models

import "gorm.io/gorm"
import "github.com/google/uuid"

type User struct {
	gorm.Model
	PublicID  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();unique"`
	Email     string    `gorm:"unique"`
	Password  string `json:"-"`// Keep the stored password hash out of API JSON responses.
	Type      string
	Firstname string
	Lastname  string
	Gender    string
	Avatar    string
}
