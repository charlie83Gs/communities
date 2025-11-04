# Scripts Directory

This directory contains utility scripts for managing the application.

## Available Scripts

### `sync-to-openfga.ts`

**Purpose:** Synchronize authorization data from PostgreSQL to OpenFGA.

**Usage:**
```bash
# Sync all communities
bun run sync:openfga

# Sync specific community
bun run sync:openfga --community=<community-id>

# Dry run (preview changes without applying)
bun run sync:openfga --dry-run

# Verbose output
bun run sync:openfga --verbose
```

**When to Use:**
- After data recovery from a backup where OpenFGA data might be stale
- If OpenFGA authorization data becomes out of sync with the database
- For debugging authorization issues

**Note:** This script is **not needed for normal operation**. Authorization data is automatically managed through the application's services. This script exists as a utility tool for data recovery scenarios.

## Removed Scripts

The following scripts were removed as they are no longer needed with the current architecture:

- ❌ `check-schema.ts` - One-time schema verification (obsolete)
- ❌ `create-tables.sql` - Manual table creation (replaced by Drizzle migrations)
- ❌ `drop-role-columns.ts` - One-time migration (completed)
- ❌ `init-openfga.sh` - OpenFGA initialization (replaced by automatic migration on startup)
- ❌ `migrate-communities.ts` - One-time migration (completed)
- ❌ `migrate-remove-type-visibility.ts` - One-time migration (completed)
- ❌ `migrate-to-openfga.ts` - Initial OpenFGA migration (completed)
- ❌ `migrate-trust-postures-to-awards.ts` - One-time migration (completed)
- ❌ `verify-communities-schema.ts` - One-time verification (obsolete)

## Current Migration Strategy

All database schema migrations are now handled by **Drizzle ORM** and run automatically on application startup:

1. **Database migrations:** Managed via `src/db/migrations/` (Drizzle)
2. **OpenFGA migrations:** Automatically run via `src/utils/openfga-migrate.ts` on app startup
3. **Authorization data:** Created directly in OpenFGA through application services

No manual migration scripts are needed for normal operation.
