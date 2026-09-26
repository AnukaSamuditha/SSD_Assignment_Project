# Matchup Frontend

Modern job matching platform frontend built with Next.js 15 (App Router) and React 19. Matchup helps candidates discover jobs and employers manage postings, companies, and applicants — with a polished UI, fast data fetching, and production-grade observability.

## Overview

Matchup Frontend implements the user-facing web app for a job marketplace:

- Candidates can browse jobs, filter by type/mode/salary, and view post details.
- Employers can manage their company profile, create/update/close jobs, and review applicants via a dashboard.
- Authentication screens enable login and signup with robust form validation.
- Error tracking and performance monitoring is integrated with Sentry across client, server, and edge.

## Features

- UI/UX: Tailwind CSS v4, shadcn UI components (Radix UI), responsive layouts, Lottie animations, Lucide/Tabler icons.
- Data Layer: Axios instance with `withCredentials`, TanStack Query v5 for caching, devtools enabled.
- State Management: Zustand persistent store for company data.
- Forms & Validation: React Hook Form + Zod schemas for auth, jobs, company, application forms.
- Rich Text: TipTap minimal editor integration.
- Charts: Recharts for dashboard visualizations.
- Images: Next Image with remote patterns for avatars and Cloudinary assets.
- Observability: Sentry integrated via `withSentryConfig`, client/server/edge instrumentation, Vercel Cron monitors auto-instrumentation.
- Performance: Turbopack in dev, modern Next.js 15 + React 19 rendering.

## Tech Stack

- Framework: Next.js `^15.5.9` (App Router), React `19.1.0`
- Styling: Tailwind CSS `^4`, PostCSS
- Components: Radix UI, shadcn UI
- Data: Axios, TanStack React Query `^5`
- State: Zustand
- Forms: React Hook Form, Zod
- Charts: Recharts
- Icons/Animation: Lucide, Tabler, Lottie
- Monitoring: Sentry (`@sentry/nextjs`)
- TypeScript: `^5`
- Linting: ESLint `^9` with `eslint-config-next`

## Project Structure

```
app/
	(auth)/             Auth layouts + login/signup pages
	(main)/             Marketing/home + posts listing and filters
	dashboard/          Employer dashboard (jobs, company, applicants)
	api/                App Router API routes (example, Sentry)
components/
	ui/                 Reusable UI primitives (shadcn + Radix)
	Posts.tsx           Fetches and renders job posts
	Post.tsx            Job post card/details
	ActiveJobsTable.tsx Dashboard jobs table
providers/
	axios.ts            Axios instance (reads NEXT_PUBLIC_SERVER)
	QueryClientProvider.tsx TanStack Query provider + devtools
	schemas.ts          Zod schemas (auth, jobs, company, application)
stores/
	company.store.ts    Zustand persistent store
lib/                  Helpers (TipTap utils, general utils)
types/                Shared TypeScript types
instrumentation*.ts   Sentry client/server/edge setup
next.config.ts        Next config with Sentry + image patterns
```

## Environment Variables

Create a `.env.local` in the project root with:

```
NEXT_PUBLIC_SERVER=https://your-backend.example.com
```

- `NEXT_PUBLIC_SERVER`: Base URL for the backend API. Used by the Axios instance and TanStack Query.
- Sentry DSN: Currently configured directly in `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`. Replace the DSN strings with your own or refactor to read from `process.env.SENTRY_DSN` if preferred.

## Scripts

- `dev`: Start the development server with Turbopack (`next dev --turbopack`).
- `build`: Build the production bundle.
- `start`: Start the production server.
- `lint`: Run ESLint.

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 18.17+ or 20+)
- npm (or your preferred package manager)

### Installation

```powershell
# Clone the repo
git clone https://github.com/AnukaSamuditha/Matchup_Frontend.git; cd Matchup_Frontend

# Create environment file
'NEXT_PUBLIC_SERVER=https://your-backend.example.com' | Out-File -Encoding utf8 .env.local

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open `http://localhost:3000` in your browser.

## Key Workflows

- Authentication: Pages under `app/(auth)/` use React Hook Form + Zod; login POSTs to `users/login` via Axios.
- Job Posts: `components/Posts.tsx` uses TanStack Query to fetch posts from `/posts/all/:page`.
- Dashboard: Employer pages under `app/dashboard/` for jobs, company, applicants, and closed jobs.
- Publishing: Create/update job posts; schemas in `providers/schemas.ts` enforce validation.

## Observability (Sentry)

- Config: `next.config.ts` wraps `withSentryConfig` and enables tree-shaking of Sentry logs, widens client file upload, and auto-instruments Vercel Cron Monitors.
- Setup files: `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
- To use your DSN: Replace DSN strings in the above files or read from `process.env.SENTRY_DSN`.

## Styling & Components

- Tailwind CSS v4 with utility-first styles.
- shadcn UI components built on Radix primitives in `components/ui/`.
- Image domains allowed: `avatar.iran.liara.run` and `res.cloudinary.com` (see `next.config.ts`).

## Contributing

1. Create a feature branch.
2. Keep changes small and focused; follow existing patterns and style.
3. Run `npm run lint` and ensure the app builds.
4. Open a PR with a clear description and screenshots where relevant.

## Deployment

- Vercel is recommended for Next.js. Ensure environment variables are set in the hosting provider.
- Sentry: Add Sentry DSN to your deployment environment or update the config files with production DSN.

## Troubleshooting

- API errors: Confirm `NEXT_PUBLIC_SERVER` points to a reachable backend and CORS settings allow your origin.
- Missing images: Check remote image domain patterns in `next.config.ts`.
- Sentry reports missing: Verify DSN configuration and that `instrumentation` files are loaded.

## License

License not specified. Treat as proprietary unless otherwise noted by the repository owner.
