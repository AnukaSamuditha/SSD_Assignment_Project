package utils

import (
	"context"
	"fmt"
	"io"
	"matchup_api/initializers"
	"mime/multipart"
	"net/http"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/admin"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
)

type DataType struct {
	Type   string
	UserID uuid.UUID
	PostID *uuid.UUID
}

// AllowedImageTypes and AllowedPDFTypes are used with ValidateUploadContentType.
var (
	AllowedImageTypes = map[string]bool{
		"image/png":  true,
		"image/jpeg": true,
		"image/gif":  true,
		"image/webp": true,
	}
	AllowedPDFTypes = map[string]bool{
		"application/pdf": true,
	}
)

// ValidateUploadContentType fixes an unrestricted-file-upload issue (CWE-434):
// callers previously trusted the client-supplied multipart Content-Type
// header, which is attacker-controlled and unrelated to the file's actual
// bytes - notably, it let an "image/svg+xml" upload through, and SVGs can
// carry a <script>/event-handler payload that executes if the file is ever
// opened as a top-level document (stored XSS, CWE-79). This instead sniffs
// the real content from the file's magic bytes via http.DetectContentType
// and checks that against an explicit allow-list, then rewinds the file so
// the caller can still read it in full for upload.
func ValidateUploadContentType(file multipart.File, allowed map[string]bool) error {
	buf := make([]byte, 512)

	n, err := file.Read(buf)

	if err != nil && err != io.EOF {
		return err
	}

	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return err
	}

	contentType := http.DetectContentType(buf[:n])

	if !allowed[contentType] {
		return fmt.Errorf("unsupported file type: %s", contentType)
	}

	return nil
}

func credentials() (*cloudinary.Cloudinary, context.Context) {
	initializers.LoadEnvs()

	cld, _ := cloudinary.New()
	cld.Config.URL.Secure = true
	ctx := context.Background()
	return cld, ctx
}

func UploadFile(cld *cloudinary.Cloudinary, ctx context.Context, file multipart.File, info DataType) (string, error) {

	var id string

	params := uploader.UploadParams{
		UniqueFilename: api.Bool(false),
		Overwrite:      api.Bool(true),
		Type:           "authenticated",
	}

	switch info.Type {
	case "image":
		id = "assets/profile/" + info.UserID.String()
		params.PublicID = id
		params.ResourceType = "image"
		params.Type = "authenticated"
	case "application/pdf":
		id = "applications/" + info.PostID.String() + "/" + info.UserID.String()
		params.PublicID = id
		params.ResourceType = "image"
		params.Type = "authenticated"
	}

	resp, err := cld.Upload.Upload(ctx, file, params)

	if err != nil {
		return "", err
	}

	if info.Type == "application/pdf" {
		asset, err := cld.Image(resp.PublicID)

		if err != nil {
			return "", err
		}

		asset.Version = resp.Version
		asset.DeliveryType = "authenticated"
		asset.AssetType = "image"
		asset.Config.URL.SignURL = true
		url, err := asset.String()
		
		if err != nil {
			return "",err
		}
    	return url, nil
	}

	return resp.SecureURL, nil
}

func GetAssetInfo(cld *cloudinary.Cloudinary, ctx context.Context, publicID string) (*admin.AssetResult, error) {

	resp, err := cld.Admin.Asset(ctx, admin.AssetParams{PublicID: publicID})
	if err != nil {
		fmt.Println("error")
	}

	if resp.Width > 900 {
		update_resp, err := cld.Admin.UpdateAsset(ctx, admin.UpdateAssetParams{
			PublicID: publicID,
			Tags:     []string{"large"}})
		if err != nil {
			fmt.Println("error")
		} else {

			fmt.Println("New tag: ", update_resp.Tags)
		}
	} else {
		update_resp, err := cld.Admin.UpdateAsset(ctx, admin.UpdateAssetParams{
			PublicID: publicID,
			Tags:     []string{"small"}})
		if err != nil {
			fmt.Println("error")
		} else {

			fmt.Println("New tag: ", update_resp.Tags)
		}
	}

	return resp, err

}

var CLD, CTX = credentials()
