package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"matchup_api/initializers"
	"os"
	"time"
)

type ResumeUpdate struct {
	ApplicationID string `json:"application_id"`
	ResumeData    any    `json:"resume_data"`
}

func UpdateResumeData(updates []ResumeUpdate) error {

	if len(updates) == 0 {
		return nil
	}

	query := `
		UPDATE applications
		SET rating_data = v.rating_data
		FROM (VALUES
	`
	args := make([]interface{}, 0, len(updates)*2)

	for i, u := range updates {
		if i > 0 {
			query += ","
		}

		query += fmt.Sprintf("($%d::uuid, $%d::jsonb)", i*2+1, i*2+2)

		jsonData, err := json.Marshal(u.ResumeData)
		if err != nil {
			return nil
		}
		args = append(args, u.ApplicationID, string(jsonData))
	}

	query += `
		) AS v(public_id, rating_data)
		WHERE applications.public_id = v.public_id
	`
	return initializers.DB.Exec(query, args...).Error
}

func ConsumeResumeResult() error {
	channel := initializers.RabbitChannel

	queue, err := channel.QueueDeclare(
		os.Getenv("RESUME_RESULT_QUEUE"),
		true, false, false, false, nil)

	if err != nil {
		return err
	}

	msgs, err := channel.Consume(
		queue.Name,
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return err
	}

	batch := make([]ResumeUpdate, 0, 50)
	ticker := time.NewTicker(2 * time.Second)

	for {
		select {
		case msg, ok := <-msgs:

			if !ok {
				log.Println("Channel is closed")
				return nil
			}

			if len(msg.Body) == 0 {
				log.Println("Empty message body received")
				msg.Nack(false, false)
				continue
			}

			var data ResumeUpdate
			if err := json.Unmarshal(msg.Body, &data); err != nil {
				log.Println("Invalid message body : ", err.Error())
				msg.Nack(false, false)
				continue
			}

			batch = append(batch, data)

			if len(batch) >= 50 {
				if err := UpdateResumeData(batch); err != nil {
					log.Println("Batch update failed : ", err.Error())
				}
				batch = batch[:0]

				msg.Ack(false)
			}

		case <-ticker.C:
			if len(batch) > 0 {
				if err := UpdateResumeData(batch); err != nil {
					log.Println("Batch update failed : ", err.Error())
				}

				batch = batch[:0]
			}
		}
	}
}

func ConsumeResumeData() {
	if err := ConsumeResumeResult(); err != nil {
		log.Fatal(err.Error())
	}
}
