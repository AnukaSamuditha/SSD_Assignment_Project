package main

import (
	"matchup_api/initializers"
	"matchup_api/models"
)

func init() {
	initializers.LoadEnvs()
	initializers.ConnectDB()
}

func main() {
	initializers.DB.Exec(`CREATE EXTENSION IF NOT EXISTS pgcrypto; `)
	initializers.DB.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

	initializers.DB.AutoMigrate(&models.User{})
	initializers.DB.AutoMigrate(&models.Post{})
	initializers.DB.AutoMigrate(&models.Application{})
	initializers.DB.AutoMigrate(&models.Company{})

	initializers.DB.Exec(`

		ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector
			GENERATED ALWAYS AS (
				setweight(to_tsvector('english', coalesce(title, '')),'A') ||
				setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
				setweight(to_tsvector('english', coalesce(summary, '')), 'C') ||
				setweight(to_tsvector('english', coalesce(location,'')), 'D')
			) STORED;

		CREATE INDEX IF NOT EXISTS posts_index ON posts USING GIN(search_vector) WHERE status = 'active';
	`)

	initializers.DB.Exec(`
		CREATE INDEX IF NOT EXISTS post_emp_type_index ON posts (emp_type);
		CREATE INDEX IF NOT EXISTS post_work_mode_index ON posts (work_mode);
		CREATE INDEX IF NOT EXISTS post_create_at_index ON posts (created_at);
	`)

	initializers.DB.Exec(`
		CREATE INDEX IF NOT EXISTS post_min_salary_index ON posts (((salary->>'min')::numeric));
	`)

	initializers.DB.Exec(`
		CREATE INDEX IF NOT EXISTS post_max_salary_index ON posts (((salary->>'max')::numeric));
	`)

	initializers.DB.Exec(`
		CREATE INDEX IF NOT EXISTS post_salary_currency_index ON posts (((salary->>'currency')::text));
	`)
}
