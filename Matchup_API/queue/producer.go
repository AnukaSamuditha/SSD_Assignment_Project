package queue

import (
	"context"
	"encoding/json"
	"matchup_api/initializers"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type ItemBody struct {
	PostID         string `json:"postID"`
	ApplicationID  string `json:"applicationID"`
	JobDescription string `json:"description"`
	ResumeURL      string `json:"resumeURL"`
	FileName       string `json:"file_name"`
}

func PublishResume(item ItemBody) error {
	channel := initializers.RabbitChannel

	queue, err := channel.QueueDeclare(
		"resume_queue",
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	body, _ := json.Marshal(item)

	err = channel.PublishWithContext(ctx, "", queue.Name, false, false, amqp.Publishing{
		DeliveryMode: amqp.Persistent,
		ContentType:  "application/json",
		Body:         []byte(body),
	})

	if err != nil {

		return err
	}

	return err

}
