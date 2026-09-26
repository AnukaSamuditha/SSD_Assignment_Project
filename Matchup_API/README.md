# Matchup API

A production-ready REST API for a job matching platform. It manages users, companies, job posts, and applications with secure authentication, caching, file uploads, and asynchronous resume ranking via RabbitMQ.

## Features

- User authentication with JWT (cookie-based)
- Company management with image/logo uploads (Cloudinary)
- Job post CRUD with pagination and status management
- Applications with PDF CV upload and ranking data
- Redis response caching for GET endpoints (configurable TTL)
- RabbitMQ queue for async resume processing and batch rating updates
- Prometheus metrics exposed at `/metrics` and GORM plugin metrics
- CORS configured for frontend at `http://localhost:3000`
- Clean modular structure with Gin, GORM (PostgreSQL), and middleware

## Tech Stack

- Language: Go (Gin, GORM)
- Database: PostgreSQL
- Cache: Redis
- Queue: RabbitMQ
- File Storage: Cloudinary
- Monitoring: Prometheus client + GORM Prometheus plugin
- Containerization: Docker

## Project Structure

```
Dockerfile
go.mod
main.go
controllers/
  applicationController.go
  companyController.go
  postController.go
  userController.go
initializers/
  connectDB.go
  loadEnvs.go
  rabbitmq.go
  redis.go
middleware/
  auth.go
  cache.go
migrations/
  migrate.go
models/
  application.go
  company.go
  post.go
  tag.go
  user.go
queue/
  consumer.go
  producer.go
requests/
  application.go
  company.go
  post.go
routes/
  applicationRoutes.go
  companyRoutes.go
  postRoutes.go
  userRoutes.go
utils/
  uploadFile.go
```

## API Overview

Base URL: `http://localhost:8080`

### Public

- `POST /users/signup` — Create a new user
- `POST /users/login` — Log in, sets `Authorization` cookie
- `GET /metrics` — Prometheus metrics

### Authenticated (requires `Authorization` cookie)

Users

- `GET /users/self` — Current user profile

Companies

- `POST /company/` — Create company (multipart with image)
- `GET /company/:id` — Get company by public ID (cached)
- `GET /company/:id/exists` — Get company by author/user ID (cached)
- `PATCH /company/:id` — Update company (optional new image)

Posts

- `POST /posts/` — Create job post
- `PATCH /posts/:id` — Update job post
- `DELETE /posts/:id` — Delete job post
- `GET /posts/:id` — Get a post by ID (cached)
- `GET /posts/company/posts/:id` — All posts for a company, with applicant counts (cached)
- `GET /posts/all/:page` — Paginated active posts (cached)

Applications

- `POST /application/` — Create application (multipart with PDF)
- `PATCH /application/:id` — Update application status
- `GET /application/:id` — Get application with applicant details (cached)
- `GET /application/post/:id` — Latest application per applicant for a post

## Authentication

- Cookie-based JWT stored as `Authorization`.
- Issued on `POST /users/login` for 30 days.
- Middleware verifies signature, expiry, and loads user into request context.

## Caching

- `middleware.CacheMiddleware(ttl)` caches successful `GET` responses in Redis.
- Keys follow `cache:<request-uri>`.
- Cache invalidation uses `DeleteCache` with pattern scan (e.g., on post/company updates).

## File Uploads

- Cloudinary is used via `utils/uploadFile.go`.
- Company logos: `image/*` files stored under `assets/profile/<userID>`.
- Applications: `application/pdf` stored under `applications/<postID>/<userID>`.
- PDF URLs are signed and delivered via authenticated access.

## Async Resume Ranking

- Producer publishes to queue `resume_queue` with payload:
  - `postID`, `applicationID`, `description`, `resumeURL`, `file_name`
- Consumer reads results from `RESUME_RESULT_QUEUE` and batch updates `applications.rating_data` JSONB.
- Batch size up to 50; tick interval 2s.

## Metrics & Monitoring

- `GET /metrics` exposes Prometheus metrics for the app.
- GORM Prometheus plugin runs an internal metrics server on port `9091`.

## Environment Variables

Create a `.env` file at the project root:

```
# Database (PostgreSQL)
DB_URL=postgres://user:password@localhost:5432/matchup?sslmode=disable

# JWT secret
SECRET=supersecretjwtkey

# Redis (TLS supported if rediss://)
REDIS_URL=redis://:password@localhost:6379/0

# RabbitMQ (CloudAMQP or local)
CLOUDAMQP_URL=amqps://user:password@host/vhost
RESUME_RESULT_QUEUE=resume_result_queue

# Cloudinary (uses CLOUDINARY_URL)
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>
```

Note: Enable PostgreSQL extension if needed:

```
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Installation

Prerequisites:

- Go 1.21+ (Docker image uses Go 1.21; module targets newer)
- PostgreSQL, Redis, RabbitMQ, Cloudinary account
- PowerShell on Windows (default shell)

Install dependencies:

```powershell
go mod download
```

Run database migrations (adjust as needed):

```powershell
go run .\migrations\migrate.go
```

Start the API:

```powershell
go run .\main.go
# or
go build -o main.exe ; .\main.exe
```

## Docker

Build the image:

```powershell
docker build -t matchup_api .
```

Run the container:

```powershell
docker run --name matchup_api -p 8080:8080 `
  -e DB_URL="postgres://user:password@host:5432/matchup?sslmode=disable" `
  -e SECRET="supersecretjwtkey" `
  -e REDIS_URL="redis://:password@host:6379/0" `
  -e CLOUDAMQP_URL="amqps://user:password@host/vhost" `
  -e RESUME_RESULT_QUEUE="resume_result_queue" `
  -e CLOUDINARY_URL="cloudinary://key:secret@cloud_name" `
  matchup_api
```

## Example Requests

Signup:

```powershell
curl -X POST http://localhost:8080/users/signup `
  -H "Content-Type: application/json" `
  -d '{"email":"alice@example.com","password":"Passw0rd!","type":"candidate","gender":"female","firstname":"Alice","lastname":"Lee"}'
```

Login:

```powershell
curl -X POST http://localhost:8080/users/login `
  -H "Content-Type: application/json" `
  -d '{"email":"alice@example.com","password":"Passw0rd!"}' `
  -i
```

(Note: Response sets the `Authorization` cookie.)

Create Company (multipart):

```powershell
curl -X POST http://localhost:8080/company/ `
  -b "Authorization=<your_jwt_cookie>" `
  -F "name=Acme" -F "description=We build rockets" -F "email=hr@acme.com" `
  -F "username=acme" -F "location=SF" -F "file=@logo.png;type=image/png"
```

Create Post:

```powershell
curl -X POST http://localhost:8080/posts/ `
  -H "Content-Type: application/json" -b "Authorization=<cookie>" `
  -d '{
    "title":"Backend Engineer",
    "description":"Golang services",
    "summary":"Core APIs",
    "empType":"full-time",
    "workMode":"remote",
    "companyID":"<companyPublicID>",
    "salary":{"min":80000,"max":120000,"currency":"USD"}
  }'
```

Apply with PDF:

```powershell
curl -X POST http://localhost:8080/application/ `
  -b "Authorization=<cookie>" `
  -F "postID=<postPublicID>" -F "companyID=<companyPublicID>" `
  -F "file=@resume.pdf;type=application/pdf"
```

## Configuration Notes

- CORS allowed origins: `http://localhost:3000` (adjust in `main.go`).
- Cache TTL: 10 minutes on selected routes (see `routes/*`).
- JWT cookie name: `Authorization`.
- Prometheus: `/metrics` via Gin; GORM plugin serves on `:9091`.

## Development Tips

- Logging: Gin logs to `gin.log` file.
- GORM: Uses `uuid_generate_v4()` for public IDs; ensure the extension exists.
- Cache invalidation: On updates/deletes, patterns in `DeleteCache` clear impacted keys.

## Contributing

- Fork and create a feature branch.
- Keep changes focused and consistent with existing style.
- Add/update docs and simple examples when you introduce new endpoints.

## License

This project’s code is owned by the repository owner. If you need a specific license, please add one in the repository.

## FAQ

- Why cookie-based JWT? Simpler for browser clients and CSRF-safe with SameSite Lax.
- Can I use a different frontend origin? Yes, update the CORS config in `main.go`.
- Do I need Cloudinary? Yes, for image/PDF storage and signed URLs in this setup.
- Where do metrics live? `/metrics` and GORM plugin on `:9091`.
