# Share App

A community resource sharing platform that enables communities to manage shared resources, trust relationships, and collaborative decision-making without monetary transactions.

## Core Features

- **Trust-Based Permissions**: Dual permission model combining role-based access and trust thresholds
- **Resource Sharing**: Members share wealth (products, services, resources) with the community, councils, or pools
- **Councils**: Specialized community groups that manage resources and create initiatives
- **Pools**: Resource aggregation for collective projects and planning
- **Community Forum**: Discussion platform with trust-based moderation and peer flagging
- **Needs System**: Express and aggregate resource requirements for community planning
- **Dispute Resolution**: Transparent mediation system for unfulfilled requests
- **Polls & Initiatives**: Community voting and collaborative decision-making
- **Analytics Dashboard**: Track community health, contributions, and engagement

## Tech Stack

- **Frontend**: SolidJS + TypeScript + TanStack Query
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Keycloak
- **Authorization**: OpenFGA (relationship-based access control)
- **Runtime**: Bun

## Prerequisites

- Docker & Docker Compose (required for all development)
- Bun (optional, only needed for local development outside Docker)

## Quick Start (Docker Compose - Recommended)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd share-8
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env and update the secrets (KEYCLOAK_CLIENT_SECRET, etc.)
# The defaults work for local development
```

### 3. Start All Services with Docker Compose

```bash
# Start all services (databases, Keycloak, OpenFGA, API, and Frontend)
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f api
docker compose logs -f frontend
```

This single command starts:
- PostgreSQL (API database on port 5432)
- PostgreSQL (Keycloak database on port 5433)
- PostgreSQL (OpenFGA database on port 5434)
- Keycloak (on port 8081)
- OpenFGA (on port 8080)
- API with hot-reload (on port 3000)
- Frontend with hot-reload (on port 5173)

### 4. Access the Application

- **Frontend**: http://localhost:5173 (with hot-reload)
- **API**: http://localhost:3000 (with hot-reload)
- **Keycloak Admin Console**: http://localhost:8081 (admin/admin)
- **OpenFGA Playground**: http://localhost:3001

### 5. Making Code Changes

The Docker setup includes hot-reload for both API and frontend:

- **API**: Edit files in `./api/src/` - changes trigger automatic restart
- **Frontend**: Edit files in `./frontend/src/` - changes trigger automatic hot-reload

No need to rebuild containers for code changes!

### 6. Initial Setup (First Time Only)

```bash
# Run database migrations
docker compose exec api bun run db:generate
docker compose exec api bun run db:push

# Initialize OpenFGA store and authorization model
docker compose exec api bun run sync:openfga
```

## Alternative: Local Development (Without Docker)

If you prefer to run services locally without Docker:

### 1. Start Infrastructure Services Only

```bash
# Start only databases, Keycloak, and OpenFGA
docker compose up -d postgres_api keycloak_db postgres_openfga keycloak openfga_migrate openfga
```

### 2. Setup Environment

```bash
# Copy environment files
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env

# Edit environment files as needed
```

### 3. Run API Locally

```bash
cd api
bun install
bun run db:push
bun run dev
```

### 4. Run Frontend Locally

```bash
cd frontend
bun install
bun run dev
```

## Default Access

- **Keycloak Admin Console**: http://localhost:8081
  - Username: `admin`
  - Password: `admin`

- **API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## Project Structure

```
share-8/
├── api/                  # Express.js backend
├── frontend/             # SolidJS frontend
├── infrastructure/       # Kubernetes/Flux deployment configs
├── uploads/              # User-uploaded files
├── logs/                 # Application logs
└── docker-compose.yml    # Local Docker Compose setup
```

## Development

### Docker Compose Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild containers after dependency changes
docker compose up -d --build

# View logs
docker compose logs -f api
docker compose logs -f frontend

# Execute commands in containers
docker compose exec api bun test
docker compose exec api bun run db:generate
docker compose exec frontend bun run build

# Restart specific service
docker compose restart api

# Stop and remove all containers, networks, and volumes
docker compose down -v
```

### API Commands (Inside Docker)

```bash
# Run tests
docker compose exec api bun test

# Generate migrations
docker compose exec api bun run db:generate

# Push schema changes
docker compose exec api bun run db:push

# Open Drizzle Studio
docker compose exec api bun run db:studio

# Type checking
docker compose exec api bunx tsc --noEmit

# Sync OpenFGA
docker compose exec api bun run sync:openfga
```

### Frontend Commands (Inside Docker)

```bash
# Build for production
docker compose exec frontend bun run build

# Run tests (if configured)
docker compose exec frontend bun test

# Type checking
docker compose exec frontend bunx tsc --noEmit
```

### Local Development Commands (Without Docker)

If running services locally:

```bash
# API
cd api
bun run dev          # Start dev server
bun test             # Run tests
bun run db:generate  # Generate migrations

# Frontend
cd frontend
bun run dev          # Start dev server
bun run build        # Build for production
```

## Kubernetes Deployment

For production Kubernetes deployment with Flux CD:

```bash
cd infrastructure

# See available deployment options
./deploy.sh development  # Local/staging deployment
./deploy.sh production   # Production deployment
```

Or use Tilt for local development:

```bash
cd infrastructure
tilt up  # Opens Tilt UI at http://localhost:10350
```

See the [infrastructure/README.md](./infrastructure/README.md) for full deployment documentation.

### Infrastructure Documentation

- [infrastructure/README.md](./infrastructure/README.md) - Complete Kubernetes deployment guide
- [infrastructure/QUICK_START.md](./infrastructure/QUICK_START.md) - Quick reference guide
- [infrastructure/TILT.md](./infrastructure/TILT.md) - Local development with Tilt

## Documentation

For detailed system documentation, see:
- [CLAUDE.md](./CLAUDE.md) - Full system overview and architecture
- [KEYCLOAK_MIGRATION_PLAN.md](./KEYCLOAK_MIGRATION_PLAN.md) - Authentication setup

## License

MIT License - see [LICENSE](./LICENSE) file for details
