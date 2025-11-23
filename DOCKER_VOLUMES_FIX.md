# Docker Volumes Issue - Permanent Fix

This document explains the Docker node_modules volume issue and the permanent solutions implemented.

## The Problem

When developing with Docker Compose, we use named volumes for `node_modules`:

```yaml
volumes:
  - ./api/src:/app/src:ro
  - api_node_modules:/app/node_modules  # Named volume
```

**Why?** Named volumes:
- Preserve dependencies between container restarts
- Avoid platform conflicts (host vs container architecture)
- Improve performance (no bind mount overhead)

**The Issue:** These volumes can become stale when:
- `package.json` changes (new dependencies added)
- `Dockerfile` changes (build instructions updated)
- Switching branches with different dependencies
- Path alias imports fail in Bun runtime

## Symptoms

1. **Module Not Found Error:**
   ```
   error: Cannot find module '@/middleware/auth.middleware'
   ```

2. **Container Crashes on Startup:**
   - Container starts but exits immediately
   - Logs show import/require errors

3. **After Package Updates:**
   - New packages not found
   - Old packages still cached

## The Solution

We implemented **three complementary fixes**:

### 1. Quick Cleanup Script

`./scripts/docker-clean.sh` - Clean stale volumes quickly

```bash
# Clean node_modules volumes and rebuild
./scripts/docker-clean.sh -v -r

# Nuclear option: clean everything including databases
./scripts/docker-clean.sh -a -r
```

**When to use:** Whenever you see module errors or after package updates.

### 2. Development Helper Script

`./scripts/dev.sh` - Common Docker operations

```bash
# Clean volumes (same as docker-clean.sh -v -r)
./scripts/dev.sh clean

# View API logs
./scripts/dev.sh logs-api

# Restart services
./scripts/dev.sh restart-api

# See all commands
./scripts/dev.sh help
```

**When to use:** Daily development workflow.

### 3. Import Convention (Permanent Fix)

**Root Cause:** Path aliases (`@/*`) don't work in Bun runtime (only during bundling)

**Solution:** Use relative imports instead of path aliases

```typescript
// ❌ DOESN'T WORK in Bun runtime (Docker)
import { userService } from '@/services/user.service';

// ✅ WORKS EVERYWHERE
import { userService } from '../../services/user.service';
```

**Why?**
- Bun resolves path aliases during bundling (`bun build`)
- Bun does NOT resolve them during runtime (`bun run`)
- Docker uses runtime mode for development with hot-reload
- Relative imports work in all scenarios

**Documentation:** See `api/CODING_STANDARDS.md` for full import conventions.

## Prevention

### For Developers

1. **Always use relative imports** - See `api/CODING_STANDARDS.md`
2. **Clean volumes after pulling updates:**
   ```bash
   git pull
   ./scripts/docker-clean.sh -v -r
   ```
3. **Use dev scripts for common operations:**
   ```bash
   ./scripts/dev.sh clean  # Instead of manual docker commands
   ```

### For Code Review

When reviewing PRs, check for:
- ❌ Path alias imports: `import { foo } from '@/...`
- ✅ Relative imports: `import { foo } from '../...`

### Future: ESLint Rule

We created `.eslintrc.import-conventions.json` that can be merged into main ESLint config:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@/*"],
        "message": "Use relative imports instead of path aliases"
      }
    ]
  }
}
```

## Quick Reference

### Daily Workflow

```bash
# Start environment
./scripts/dev.sh start

# Watch logs while coding
./scripts/dev.sh logs-api

# After adding packages
cd api
bun add express-rate-limit
cd ..
./scripts/dev.sh clean  # Clean and rebuild

# End of day
./scripts/dev.sh stop
```

### Troubleshooting Checklist

1. **Module not found error?**
   ```bash
   ./scripts/docker-clean.sh -v -r
   ```

2. **Pulled updates and things broke?**
   ```bash
   ./scripts/docker-clean.sh -v -r
   ```

3. **Added new packages and they're not found?**
   ```bash
   ./scripts/docker-clean.sh -v -r
   ```

4. **Want to start completely fresh?**
   ```bash
   ./scripts/docker-clean.sh -a -r  # ⚠️ Destroys database
   ```

## Documentation

- [scripts/README.md](./scripts/README.md) - Detailed script documentation
- [api/CODING_STANDARDS.md](./api/CODING_STANDARDS.md) - Import conventions
- [README.md](./README.md) - Main project documentation with troubleshooting section

## Technical Details

### Why Bun Doesn't Support Runtime Path Mappings

Bun reads `tsconfig.json` for **type checking and bundling**, but not for **runtime module resolution**.

**During bundling** (`bun build`):
- Bun resolves all imports
- Creates a single output file
- Path aliases are converted to actual paths

**During runtime** (`bun run`):
- Bun executes code directly
- Imports are resolved using Node.js resolution algorithm
- Path aliases are NOT automatically resolved

**Workarounds exist** (preload scripts, custom loaders) but they:
- Add complexity
- May break hot-reload
- Require maintenance as Bun evolves

**Simple solution:** Use relative imports (the standard Node.js way).

### Alternative Approaches Considered

1. ❌ **Bun preload script** - Doesn't work reliably with hot-reload
2. ❌ **Custom module resolver** - Adds complexity, may break
3. ❌ **Build step before running** - Defeats purpose of hot-reload
4. ✅ **Relative imports** - Standard, reliable, works everywhere

## Conclusion

The permanent fix is **using relative imports** as documented in `api/CODING_STANDARDS.md`.

The cleanup scripts are **a convenience tool** for when volumes get stale, not a workaround for the import issue.

**Going forward:**
- New code uses relative imports ✅
- Old code gradually migrated to relative imports
- ESLint rule (future) prevents path alias usage
- Cleanup script available for volume issues
