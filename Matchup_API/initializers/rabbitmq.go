package initializers

import (
	"log"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

var RabbitConn *amqp.Connection
var RabbitChannel *amqp.Channel

func ConnectRabbitMQ() {
	var err error
	RabbitConn, err = amqp.Dial(os.Getenv("CLOUDAMQP_URL"))

	if err != nil {
		log.Fatal("Error in connecting with RabbitMQ :" + err.Error())

		return
	}

	RabbitChannel, err = RabbitConn.Channel()

	if err != nil {
		log.Fatal("Error openning the channel")

		return
	}

	log.Println("Connected to RabbitMQ...")
}
