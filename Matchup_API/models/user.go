package models

import "gorm.io/gorm"
import "github.com/google/uuid"

type User struct {
	gorm.Model
	PublicID  uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();unique"`
	Email     string    `gorm:"unique"`
	Password  string `json:"-"`
	Type      string
	Firstname string
	Lastname  string
	Gender    string
	Avatar    string

	// Provider/ProviderID identify how the account authenticates. "local"
	// accounts (the default) log in with Email+Password and leave ProviderID
	// nil; OIDC-based accounts (e.g. "google") have no Password and are
	// looked up by ProviderID (the provider's stable subject/"sub" claim)
	// instead. ProviderID is a pointer so it's SQL NULL - not empty string -
	// for local accounts, since a plain unique index would otherwise treat
	// every local account's ProviderID as the same value and reject all but
	// the first signup.
	Provider   string  `gorm:"default:local;uniqueIndex:idx_provider_identity"`
	ProviderID *string `gorm:"uniqueIndex:idx_provider_identity"`
}
