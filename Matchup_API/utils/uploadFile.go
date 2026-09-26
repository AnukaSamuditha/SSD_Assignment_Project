package utils

import (
	"context"
	"fmt"
	"matchup_api/initializers"
	"mime/multipart"

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
