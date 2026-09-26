package initializers

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnvs() {
	err := godotenv.Load()

	if err != nil {
		log.Println("Error in loading environment variables! ", err)
	}
}
