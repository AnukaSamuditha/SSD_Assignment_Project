package controllers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"matchup_api/initializers"
	"matchup_api/models"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
)

const googleOAuthStateCookie = "oauth_google_state"
const googleOAuthStateTTL = 10 * time.Minute

// googleOAuthState is what we persist server-side (in Redis) for the
// lifetime of a single login attempt, keyed by the random `state` value.
// None of this is exposed to the browser except the `state` itself (echoed
// back by Google) and, separately, in the httpOnly state cookie used to bind
// the callback to the same browser that started the flow.
type googleOAuthState struct {
	CodeVerifier string `json:"code_verifier"`
	Nonce        string `json:"nonce"`
	AccountType  string `json:"account_type"`
}

func randomURLSafeString() (string, error) {
	buf := make([]byte, 32)

	if _, err := rand.Read(buf); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(buf), nil
}

// GoogleLogin starts the OpenID Connect Authorization Code flow (with PKCE)
// against Google. It never touches the database - it just prepares the
// redirect and stashes what the callback will need to finish the exchange.
func GoogleLogin(c *gin.Context) {
	if initializers.GoogleOAuthConfig == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Google sign-in is not configured",
		})

		return
	}

	// SECURITY: mirrors the same allow-list SignUp uses for `body.Type` -
	// this value ends up as the Type on a newly created account, so it must
	// be restricted to the two roles the product actually offers rather than
	// trusted verbatim from the query string.
	accountType := c.DefaultQuery("type", "regular")

	if accountType != "employer" && accountType != "regular" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid account type",
		})

		return
	}

	state, err := randomURLSafeString()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start Google sign-in"})
		return
	}

	nonce, err := randomURLSafeString()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start Google sign-in"})
		return
	}

	verifier := oauth2.GenerateVerifier()

	stored := googleOAuthState{
		CodeVerifier: verifier,
		Nonce:        nonce,
		AccountType:  accountType,
	}

	payload, err := json.Marshal(stored)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start Google sign-in"})
		return
	}

	if err := initializers.Redis.Set(c.Request.Context(), "oauth:google:"+state, payload, googleOAuthStateTTL).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to start Google sign-in"})
		return
	}

	// SECURITY (login CSRF / OAuth state binding): an unguessable `state`
	// stored server-side stops an attacker from forging a *valid* state, but
	// on its own doesn't stop an attacker from starting their own real login
	// flow and tricking the victim's browser into completing it (which would
	// silently log the victim into the attacker's account). Binding `state`
	// to a short-lived, httpOnly cookie set on *this* response means the
	// callback below only succeeds if the same browser that started the flow
	// is the one finishing it.
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(googleOAuthStateCookie, state, int(googleOAuthStateTTL.Seconds()), "/users/oauth/google", "", true, true)

	authURL := initializers.GoogleOAuthConfig.AuthCodeURL(
		state,
		oauth2.S256ChallengeOption(verifier),
		oidc.Nonce(nonce),
	)

	c.Redirect(http.StatusFound, authURL)
}

// GoogleCallback finishes the flow: validates `state`, exchanges the code
// for tokens using the PKCE verifier, verifies the ID token, and then
// finds/links/creates the local user before issuing our own session cookie
// exactly like the password-based Login/SignUp handlers do.
func GoogleCallback(c *gin.Context) {
	frontendURL := os.Getenv("FRONTEND_URL")

	fail := func(reason string) {
		log.Println("Google OAuth callback failed: ", reason)
		c.Redirect(http.StatusFound, frontendURL+"/login?error=oauth_failed")
	}

	if initializers.GoogleOAuthConfig == nil {
		fail("Google sign-in not configured")
		return
	}

	cookieState, err := c.Cookie(googleOAuthStateCookie)

	if err != nil || cookieState == "" {
		fail("missing state cookie")
		return
	}

	// Clear the one-time state cookie regardless of outcome.
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(googleOAuthStateCookie, "", -1, "/users/oauth/google", "", true, true)

	queryState := c.Query("state")

	if queryState == "" || queryState != cookieState {
		fail("state mismatch")
		return
	}

	redisKey := "oauth:google:" + queryState

	payload, err := initializers.Redis.Get(c.Request.Context(), redisKey).Result()

	if err != nil {
		fail("unknown or expired state")
		return
	}

	// Single-use: a captured/replayed callback URL can't be exchanged twice.
	initializers.Redis.Del(c.Request.Context(), redisKey)

	var stored googleOAuthState

	if err := json.Unmarshal([]byte(payload), &stored); err != nil {
		fail("corrupt state payload")
		return
	}

	code := c.Query("code")

	if code == "" {
		fail("missing authorization code")
		return
	}

	ctx := context.Background()

	token, err := initializers.GoogleOAuthConfig.Exchange(ctx, code, oauth2.VerifierOption(stored.CodeVerifier))

	if err != nil {
		fail("code exchange failed: " + err.Error())
		return
	}

	rawIDToken, ok := token.Extra("id_token").(string)

	if !ok || rawIDToken == "" {
		fail("no id_token in token response")
		return
	}

	idToken, err := initializers.GoogleIDTokenVerifier.Verify(ctx, rawIDToken)

	if err != nil {
		fail("id_token verification failed: " + err.Error())
		return
	}

	if idToken.Nonce != stored.Nonce {
		fail("nonce mismatch")
		return
	}

	var claims struct {
		Subject       string `json:"sub"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		GivenName     string `json:"given_name"`
		FamilyName    string `json:"family_name"`
		Picture       string `json:"picture"`
	}

	if err := idToken.Claims(&claims); err != nil {
		fail("failed to parse id_token claims")
		return
	}

	if !claims.EmailVerified || claims.Email == "" || claims.Subject == "" {
		fail("Google account email is not verified")
		return
	}

	user, err := findOrCreateGoogleUser(claims.Subject, claims.Email, claims.GivenName, claims.FamilyName, claims.Picture, stored.AccountType)

	if err != nil {
		fail("failed to find or create user: " + err.Error())
		return
	}

	sessionToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"ID":   user.ID,
		"exp":  time.Now().Add(time.Hour * 24 * 7).Unix(),
		"type": user.Type,
	})

	tokenString, err := sessionToken.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		fail("failed to create session token")
		return
	}

	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", true, true)

	c.Redirect(http.StatusFound, frontendURL+"/oauth/callback")
}

// findOrCreateGoogleUser implements the account-linking policy: match by
// (provider, provider_id) first, then fall back to matching by email so an
// existing local (password) account gets linked to the Google identity
// rather than creating a duplicate. Linking by email is safe here because
// Google only issues `email_verified: true` for addresses it has confirmed
// ownership of.
func findOrCreateGoogleUser(googleSub, email, givenName, familyName, picture, accountType string) (models.User, error) {
	var user models.User

	result := initializers.DB.Where("provider = ? AND provider_id = ?", "google", googleSub).First(&user)

	if result.Error == nil {
		return user, nil
	}

	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return models.User{}, result.Error
	}

	sub := googleSub

	result = initializers.DB.Where("email = ?", email).First(&user)

	if result.Error == nil {
		user.Provider = "google"
		user.ProviderID = &sub

		if err := initializers.DB.Save(&user).Error; err != nil {
			return models.User{}, err
		}

		return user, nil
	}

	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return models.User{}, result.Error
	}

	if givenName == "" {
		givenName = "Google"
	}

	if familyName == "" {
		familyName = "User"
	}

	if picture == "" {
		picture = "https://api.dicebear.com/9.x/dylan/svg?seed=" + url.QueryEscape(givenName)
	}

	user = models.User{
		Email:      email,
		Type:       accountType,
		Firstname:  givenName,
		Lastname:   familyName,
		Avatar:     picture,
		Provider:   "google",
		ProviderID: &sub,
	}

	if err := initializers.DB.Create(&user).Error; err != nil {
		return models.User{}, err
	}

	return user, nil
}
