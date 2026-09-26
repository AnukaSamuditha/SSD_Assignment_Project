package initializers

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/plugin/prometheus"
)

var DB *gorm.DB

func ConnectDB() {
	var error error

	dsn := os.Getenv("DB_URL")
	DB, error = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if error != nil {
		log.Fatal("Error in connecting to the database!", error.Error())
	}

	err := DB.Use(prometheus.New(prometheus.Config{
		DBName:          "matchup",
		RefreshInterval: 15,
		PushAddr:        "",
		StartServer:     true,
		HTTPServerPort:  9091,
	}))

	if err != nil {
		log.Fatal(err)
	}

	log.Print("Connected to the database...")
}
