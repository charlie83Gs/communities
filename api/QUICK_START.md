# Quick Start Guide

Get up and running with the application and OpenFGA in minutes.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0
- [Docker](https://www.docker.com/) and Docker Compose
- Git

## Complete Setup (First Time)

### Step 1: Start Services

Start all required services using Docker Compose:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (application database) on port 5432
- PostgreSQL (SuperTokens database) on port 5433
- PostgreSQL (OpenFGA database) on port 5434
- SuperTokens (authentication) on port 3567
- OpenFGA (authorization) on port 8080

### Step 2: Verify Services

Check that all services are healthy:

```bash
docker-compose ps
```

All services should show "Up" and "healthy" status.

### Step 3: Install Dependencies

```bash
bun install
```

### Step 4: Configure Environment

The `.env` file is already configured with correct values for Docker Compose setup.

**Important**: The default `.env` assumes your app runs locally while services run in Docker.

If everything looks good, you're ready to start!

### Step 5: Start the Application

```bash
bun run dev
```

The application will:
- Start on port 3000
- Automatically connect to PostgreSQL, SuperTokens, and OpenFGA
- Auto-create OpenFGA store and authorization model on first run

Look for this in the logs:
```
OpenFGA initialized successfully
Created OpenFGA store: <store-id>
Created OpenFGA authorization model: <model-id>
```

### Step 6: Run Data Migration

**Important**: Run this ONCE after first successful startup:

```bash
# In a new terminal
bun run migrate:openfga
```

This syncs existing permissions from the database to OpenFGA.

## Verification

### Test the Application

1. Visit http://localhost:3000 (or your API_DOMAIN)
2. Access the API documentation at http://localhost:3000/openapi/docs
3. Try creating a community and adding members
4. Verify permissions work correctly

### Test OpenFGA

1. Visit OpenFGA Playground at http://localhost:3001
2. View your authorization model
3. Check relationships and permissions

### View Logs

```bash
# View all service logs
docker-compose logs

# View OpenFGA logs specifically
docker-compose logs -f openfga

# View application logs
# (visible in the terminal where you ran 'bun run dev')
```

## Daily Development Workflow

```bash
# 1. Start services (if not already running)
docker-compose up -d

# 2. Start your application
bun run dev

# 3. Develop and test
# (application auto-reloads on file changes)

# 4. Stop when done
docker-compose down  # Stops services but keeps data
# OR
docker-compose down -v  # Stops services and removes all data
```

## Common Commands

### Database Management

```bash
# Run database migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio

# Push schema changes
bun run db:push
```

### Service Management

```bash
# View service status
docker-compose ps

# Restart a service
docker-compose restart openfga

# View logs
docker-compose logs -f openfga

# Stop all services
docker-compose down

# Start fresh (removes all data)
docker-compose down -v && docker-compose up -d
```

### OpenFGA Management

```bash
# Run migration (sync existing data to OpenFGA)
bun run migrate:openfga

# Test OpenFGA connection
curl http://localhost:8080/healthz
```

## Troubleshooting

### Services won't start

```bash
# Check for port conflicts
lsof -i :5432
lsof -i :5433
lsof -i :5434
lsof -i :3567
lsof -i :8080

# View detailed logs
docker-compose logs

# Rebuild services
docker-compose down
docker-compose up -d --build
```

### Application can't connect to OpenFGA

1. **Verify OpenFGA is running:**
   ```bash
   docker-compose ps openfga
   curl http://localhost:8080/healthz
   ```

2. **Check environment variables:**
   ```bash
   cat .env | grep OPENFGA
   ```

   Should show:
   ```
   OPENFGA_API_URL=http://localhost:8080
   ```

3. **Check application logs for errors**

### Permission checks failing

```bash
# Run the migration script again
bun run migrate:openfga

# Check OpenFGA store was created
curl http://localhost:8080/stores
```

### Want to start completely fresh

```bash
# Stop and remove everything
docker-compose down -v

# Remove node modules (optional)
rm -rf node_modules

# Start fresh
bun install
docker-compose up -d
bun run dev

# Wait for app to initialize OpenFGA, then:
bun run migrate:openfga
```

## Project Structure

```
api/
├── docker-compose.yml           # Services configuration
├── .env                         # Environment variables
├── src/
│   ├── config/
│   │   └── openfga.model.ts     # Authorization model
│   ├── services/
│   │   ├── openfga.service.ts   # OpenFGA client
│   │   └── accesscontrol.service.ts
│   └── app.ts                   # App initialization
├── scripts/
│   └── migrate-to-openfga.ts    # Migration script
└── docs/
    ├── QUICK_START.md           # This file
    ├── DOCKER_SETUP.md          # Detailed Docker guide
    ├── MIGRATION_SUMMARY.md     # Migration overview
    └── OPENFGA_MIGRATION.md     # Complete migration docs
```

## Available Scripts

```bash
bun run dev              # Start development server with hot reload
bun run build            # Build for production
bun run start            # Start production server
bun run test             # Run tests
bun run test:e2e         # Run end-to-end tests
bun run lint             # Lint code
bun run format           # Format code
bun run db:generate      # Generate database migrations
bun run db:migrate       # Run database migrations
bun run db:push          # Push schema changes
bun run db:studio        # Open Drizzle Studio
bun run migrate:openfga  # Migrate data to OpenFGA
```

## Next Steps

Now that everything is running:

1. **Read the API documentation**: http://localhost:3000/openapi/docs
2. **Learn about OpenFGA**: See `OPENFGA_MIGRATION.md`
3. **Understand the authorization model**: See `src/config/openfga.model.ts`
4. **Explore Docker services**: See `DOCKER_SETUP.md`

## Getting Help

- **Docker issues**: See `DOCKER_SETUP.md`
- **OpenFGA issues**: See `OPENFGA_MIGRATION.md`
- **Application issues**: Check application logs
- **Permission issues**: Run `bun run migrate:openfga`

## Production Deployment

For production:

1. Use environment-specific `.env` files
2. Consider using managed services:
   - Managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
   - OpenFGA Cloud (https://openfga.dev/)
3. Set secure passwords and API keys
4. Enable TLS/SSL for all connections
5. Set up monitoring and logging
6. Review `OPENFGA_MIGRATION.md` for production considerations

## Quick Reference

| Service | Port | Access |
|---------|------|--------|
| Application | 3000 | http://localhost:3000 |
| OpenAPI Docs | 3000 | http://localhost:3000/openapi/docs |
| PostgreSQL (API) | 5432 | localhost:5432 |
| PostgreSQL (SuperTokens) | 5433 | localhost:5433 |
| PostgreSQL (OpenFGA) | 5434 | localhost:5434 |
| SuperTokens | 3567 | http://localhost:3567 |
| OpenFGA API | 8080 | http://localhost:8080 |
| OpenFGA gRPC | 8081 | localhost:8081 |
| OpenFGA Playground | 3001 | http://localhost:3001 |

---

**Ready to start developing!** 🚀

If you encounter any issues, refer to the troubleshooting section or check the detailed documentation files.
