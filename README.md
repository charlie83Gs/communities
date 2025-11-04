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

- Bun (latest version)
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Keycloak (via Docker)
- OpenFGA (via Docker)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd share-8
```

### 2. Configure Environment Variables

```bash
# Copy template to API
cp .env.template api/.env

# Copy template to Frontend
cp .env.template frontend/.env.local

# Edit the files with your configuration
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL, Keycloak, and OpenFGA
docker compose up -d
```

### 4. Setup Database

```bash
cd api

# Run database migrations
bun run db:migrate

# (Optional) Seed initial data
bun run db:seed
```

### 5. Setup OpenFGA Authorization Model

```bash
cd api

# Initialize OpenFGA store and authorization model
bun run openfga:setup
```

### 6. Start API Server

```bash
cd api
bun run dev
```

The API will be available at `http://localhost:3000`

### 7. Start Frontend

```bash
cd frontend
bun install
bun run dev
```

The frontend will be available at `http://localhost:5173`

## Default Access

- **Keycloak Admin Console**: http://localhost:8081
  - Username: `admin`
  - Password: `admin`

- **API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## Project Structure

```
share-8/
├── api/              # Express.js backend
├── frontend/         # SolidJS frontend
├── uploads/          # User-uploaded files
├── logs/             # Application logs
└── docker-compose.yml
```

## Development

### API Commands

```bash
cd api

# Start development server
bun run dev

# Run migrations
bun run db:migrate

# Run tests
bun test

# Type checking
bun run typecheck
```

### Frontend Commands

```bash
cd frontend

# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun test
```

## Documentation

For detailed system documentation, see:
- [CLAUDE.md](./CLAUDE.md) - Full system overview and architecture
- [KEYCLOAK_MIGRATION_PLAN.md](./KEYCLOAK_MIGRATION_PLAN.md) - Authentication setup

## License

MIT License - see [LICENSE](./LICENSE) file for details
