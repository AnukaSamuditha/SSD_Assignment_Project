package initializers

import (
	"context"
	"log"
	"os"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

// GoogleOIDCProvider does the OIDC discovery handshake against Google once at
// startup (fetching https://accounts.google.com/.well-known/openid-configuration)
// and is reused for every login - it caches Google's signing keys (JWKS) so
// each callback doesn't have to re-fetch them.
var GoogleOIDCProvider *oidc.Provider

// GoogleOAuthConfig holds the client ID/secret/redirect URL/scopes used to
// build the authorization URL and to exchange the auth code for tokens.
var GoogleOAuthConfig *oauth2.Config

// GoogleIDTokenVerifier checks an ID token's signature (against Google's
// JWKS), issuer, audience and expiry per the OIDC spec.
var GoogleIDTokenVerifier *oidc.IDTokenVerifier

func ConnectGoogleOAuth() {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")

	if clientID == "" || clientSecret == "" || redirectURL == "" {
		log.Println("Google OAuth not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REDIRECT_URL missing) - 'Sign in with Google' will be unavailable.")
		return
	}

	provider, err := oidc.NewProvider(context.Background(), "https://accounts.google.com")

	if err != nil {
		log.Println("Failed to discover Google OIDC configuration, 'Sign in with Google' will be unavailable: ", err)
		return
	}

	GoogleOIDCProvider = provider
	GoogleIDTokenVerifier = provider.Verifier(&oidc.Config{ClientID: clientID})

	GoogleOAuthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "email", "profile"},
	}

	log.Println("Google OAuth configured successfully!")
}
