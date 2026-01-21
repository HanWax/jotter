# AGENTS.md

Operational guide for the Jotter project. Keep this file lean and operational only.

## Build Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (all apps)
pnpm dev
```

## Type Check

```bash
pnpm typecheck
```

## Lint

```bash
pnpm lint
```

## Test

```bash
pnpm test
```

## Database (Drizzle + Neon)

```bash
# Generate migrations from schema changes
pnpm --filter @jotter/api db:generate

# Apply migrations to database
pnpm --filter @jotter/api db:migrate

# Open Drizzle Studio
pnpm --filter @jotter/api db:studio
```

## Project Structure

```
jotter/
├── apps/
│   ├── api/          # Cloudflare Workers + Hono API
│   └── web/          # Vite + React frontend
├── packages/
│   └── shared/       # Shared types and Zod schemas
├── docs/             # PRD and task files
└── docs.local/       # Local working files (gitignored)
```

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **API**: Cloudflare Workers, Hono, Drizzle ORM, Neon Postgres
- **Web**: Vite, React 18, TanStack Router, TanStack Query, Tiptap
- **Auth**: Clerk
- **Styling**: Tailwind CSS
- **Validation**: Zod (shared schemas)

## Key Patterns

- Zod schemas in `packages/shared/src/schemas.ts` - use for validation on both API and web
- Drizzle schema in `apps/api/src/db/schema.ts` - source of truth for database
- API routes in `apps/api/src/routes/` - one file per resource
- React hooks in `apps/web/src/hooks/` - data fetching with TanStack Query

## Environment Variables

API requires:
- `DATABASE_URL` - Neon connection string
- `CLERK_SECRET_KEY` - Clerk backend key

Web requires:
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk frontend key
- `VITE_API_URL` - API base URL
