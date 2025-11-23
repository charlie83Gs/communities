# Development Scripts

Helper scripts for local development with Docker Compose.

## Quick Reference

### Common Operations

```bash
# Start development environment
./scripts/dev.sh start

# View API logs
./scripts/dev.sh logs-api

# Restart API after code changes (usually not needed - has hot reload)
./scripts/dev.sh restart-api

# Open shell in API container
./scripts/dev.sh shell-api

# See all available commands
./scripts/dev.sh help
```

### Troubleshooting

```bash
# Fix "Cannot find module" errors (clean node_modules volumes)
./scripts/docker-clean.sh -v -r

# Or using dev script
./scripts/dev.sh clean

# Nuclear option: clean everything including databases
./scripts/docker-clean.sh -a -r
./scripts/dev.sh clean-all  # same thing
```

## Scripts

### `dev.sh` - Development Helper

Quick access to common Docker Compose operations.

**Usage:** `./scripts/dev.sh [COMMAND]`

**Commands:**

| Command | Description |
|---------|-------------|
| `start` | Start all services |
| `stop` | Stop all services |
| `restart` | Restart all services |
| `restart-api` | Restart only API |
| `restart-frontend` | Restart only frontend |
| `logs` | Show all logs (follow mode) |
| `logs-api` | Show API logs (follow mode) |
| `logs-frontend` | Show frontend logs (follow mode) |
| `status` | Show container status |
| `shell-api` | Open shell in API container |
| `shell-frontend` | Open shell in frontend container |
| `clean` | Clean node_modules volumes |
| `clean-all` | Clean all volumes ⚠️ destroys data |
| `rebuild` | Rebuild all services |
| `rebuild-api` | Rebuild API service |
| `rebuild-frontend` | Rebuild frontend service |

**Examples:**

```bash
# Start development environment
./scripts/dev.sh start

# Watch API logs
./scripts/dev.sh logs-api

# Clean stale node_modules
./scripts/dev.sh clean

# Rebuild after Dockerfile changes
./scripts/dev.sh rebuild-api
```

### `docker-clean.sh` - Volume Cleanup

Cleans Docker volumes to resolve issues with stale dependencies.

**Usage:** `./scripts/docker-clean.sh [OPTIONS]`

**Options:**

| Option | Description |
|--------|-------------|
| `-v, --volumes` | Clean only node_modules volumes (default, safe) |
| `-a, --all` | Clean ALL volumes including databases ⚠️ |
| `-r, --rebuild` | Rebuild containers after cleaning |
| `-h, --help` | Show help |

**Examples:**

```bash
# Clean node_modules volumes only (safe)
./scripts/docker-clean.sh -v

# Clean and rebuild
./scripts/docker-clean.sh -v -r

# Nuclear option: clean everything
./scripts/docker-clean.sh -a -r
```

## Common Issues

### "Cannot find module" Error

**Symptom:** API fails to start with `Cannot find module '@/...'` or similar

**Cause:** Stale node_modules in Docker volume after package updates or Dockerfile changes

**Solution:**

```bash
./scripts/docker-clean.sh -v -r
# or
./scripts/dev.sh clean
```

### Container Won't Start After Package Update

**Symptom:** Container starts but crashes immediately after adding new dependencies

**Cause:** node_modules volume out of sync with package.json

**Solution:**

```bash
# Clean volumes and rebuild
./scripts/docker-clean.sh -v -r
```

### Need Fresh Database

**Symptom:** Want to reset all data to start fresh

**Solution:**

```bash
# ⚠️ WARNING: This destroys all local data
./scripts/docker-clean.sh -a -r
```

## Why These Scripts Exist

### The node_modules Volume Problem

Docker Compose uses named volumes for `node_modules` to:
- Preserve dependencies between container restarts
- Avoid conflicts with host node_modules (different platform/architecture)
- Improve performance (no bind mount overhead)

However, these volumes can become stale when:
- package.json changes
- Dockerfile changes
- Dependencies are updated
- Switching between branches with different dependencies

### The Path Alias Issue

Bun (the JavaScript runtime we use) handles path aliases differently:
- **During bundling:** Path aliases from tsconfig.json work fine
- **At runtime:** Path aliases don't resolve without additional configuration

**Best practice:** Use relative imports in the codebase instead of path aliases.

```typescript
// ❌ Doesn't work reliably in Bun runtime (Docker)
import { foo } from '@/services/foo.service';

// ✅ Works everywhere
import { foo } from '../../services/foo.service';
```

## Development Workflow

### Typical Day

```bash
# 1. Start environment (once per day)
./scripts/dev.sh start

# 2. Watch logs while coding
./scripts/dev.sh logs-api

# 3. Code changes (hot reload handles most changes automatically)
# No restart needed for most code changes!

# 4. If you add new dependencies
cd api
bun install
cd ..
./scripts/docker-clean.sh -v -r  # Clean volumes, rebuild

# 5. End of day
./scripts/dev.sh stop
```

### After Pulling Updates

```bash
# If package.json or Dockerfile changed
./scripts/docker-clean.sh -v -r

# If database schema changed
./scripts/dev.sh restart-api  # Migrations run automatically
```

## See Also

- [Main README](../README.md) - Project overview
- [API Documentation](../api/README.md) - API development guide
- [Frontend Documentation](../frontend/README.md) - Frontend development guide
