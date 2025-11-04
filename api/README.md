# API

Express.js API with TypeScript, SuperTokens authentication, Drizzle ORM, and OpenFGA authorization.

## Setup

Install dependencies:

```bash
bun install
```

## Development

Start the development server:

```bash
bun dev
```

The server runs on `http://localhost:3000` by default.

## Database Migrations

### Workflow

This project uses Drizzle ORM with **automatic migrations on startup**. The workflow is:

1. **Modify schema files** in `src/db/schema/`
2. **Generate migration files** using:
   ```bash
   bun run db:generate
   ```
   This creates SQL migration files in `src/db/migrations/`
3. **Start the server** - migrations run automatically
   ```bash
   bun dev
   ```

### Migration Scripts

- `bun run db:generate` - Generate SQL migration files from schema changes
- `bun run db:push` - Push schema directly to database (development only, bypasses migrations)
- `bun run db:studio` - Open Drizzle Studio to view/edit database

### How It Works

- Migrations run automatically during application initialization (before SuperTokens and OpenFGA)
- The migration system uses a dedicated postgres client with `max: 1` (best practice for postgres-js)
- Migration status is logged to the console on startup
- If migrations fail, the application will not start
- Only new migrations (not yet in the database) are executed

### Migration Files

Migration files are stored in `src/db/migrations/` and are executed in order by filename.

### Transition Note

If you're transitioning from `db:push` to the migration system, the database already has tables but the migration history is empty. In this case:

1. All existing migration files have been marked as "applied" in the database
2. Future migrations will run automatically on startup
3. You should **NOT** use `db:push` anymore - always use `db:generate` instead

## API Documentation

Swagger documentation is available at:
- UI: `http://localhost:3000/openapi/docs`
- JSON: `http://localhost:3000/openapi/json`

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `SUPERTOKENS_URI` - SuperTokens core service URL
- `FGA_API_URL` - OpenFGA service URL
- `API_DOMAIN` - API server domain
- `WEBSITE_DOMAIN` - Frontend application domain

## Built with Bun

This project was created using `bun init` in bun v1.2.21. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
