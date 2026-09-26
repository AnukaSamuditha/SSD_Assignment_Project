package initializers

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client
var Ctx = context.Background()

func ConnectRedis() {

	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))

	if err != nil {
		panic("Failed to parse Redis URL : " + err.Error())
	}

	Redis = redis.NewClient(&redis.Options{
		Addr:      opt.Addr,
		Password:  opt.Password,
		DB:        0,
		TLSConfig: opt.TLSConfig,
	})

	_, err = Redis.Ping(Ctx).Result()

	if err != nil {
		panic("Failed to connect to Redis : " + err.Error())
	}

	log.Println("Connected to Redis successfully!")
}
