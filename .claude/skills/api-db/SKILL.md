---
name: api-db
description: This skill teaches the agent how to manage database schemas and migrations in the API project. MANDATORY - You MUST read this skill before modifying any database schema or migration files.
---

# API Database & Migrations Skill

## Purpose
This skill covers the database layer of the API project, including schema definition, migrations, and type-safe database access patterns.

## When to Use This Skill
- Creating new database tables
- Modifying existing schemas
- Generating and applying migrations
- Understanding table relationships
- Setting up database constraints

## Drizzle Configuration

```typescript
// api/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Schema Definition Patterns

### 1. Basic Table Schema
```typescript
// api/src/db/schema/communities.schema.ts
import { pgTable, uuid, varchar, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // Trust System Configuration (stored as JSONB)
  minTrustToAwardTrust: jsonb('min_trust_to_award_trust')
    .notNull()
    .default({ type: 'number', value: 15 }),

  trustTitles: jsonb('trust_titles').default({
    titles: [
      { name: 'New', minScore: 0 },
      { name: 'Stable', minScore: 10 },
      { name: 'Trusted', minScore: 50 }
    ]
  }),

  minTrustForWealth: jsonb('min_trust_for_wealth')
    .notNull()
    .default({ type: 'number', value: 10 }),

  // Analytics Configuration
  nonContributionThresholdDays: integer('non_contribution_threshold_days').default(30),
  dashboardRefreshInterval: integer('dashboard_refresh_interval').default(3600),

  // Audit fields
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});
```

### 2. Foreign Key Relationships
```typescript
// api/src/db/schema/communityMembers.schema.ts
import { pgTable, uuid, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { communities } from './communities.schema';
import { appUsers } from './appUsers.schema';

export const resourceMemberships = pgTable('resource_memberships', {
  resourceId: uuid('resource_id').notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull(), // 'community', 'council', etc.
  userId: text('user_id').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'admin', 'member', etc.

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.resourceId, table.resourceType, table.userId] }),
}));
```

### 3. Enums
```typescript
// api/src/db/schema/wealth.schema.ts
import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define enum types
export const wealthTypeEnum = pgEnum('wealth_type', ['object', 'service']);
export const wealthStatusEnum = pgEnum('wealth_status', ['active', 'fulfilled', 'expired', 'cancelled']);
export const wealthRequestStatusEnum = pgEnum('wealth_request_status', [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'fulfilled'
]);

export const wealth = pgTable('wealth', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').notNull()
    .references(() => appUsers.id),

  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  type: wealthTypeEnum('type').notNull(),
  status: wealthStatusEnum('status').notNull().default('active'),
  quantity: integer('quantity'),

  // Target sharing
  targetType: text('target_type').notNull(), // 'community', 'council', 'pool'
  targetId: uuid('target_id'), // null for community-wide

  // Trust gating
  minTrustRequired: integer('min_trust_required'),

  // Expiration
  expiresAt: timestamp('expires_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
```

### 4. Junction Tables (Many-to-Many)
```typescript
// api/src/db/schema/trustAwards.schema.ts
export const trustAwards = pgTable('trust_awards', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  fromUserId: text('from_user_id').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'), // Represents trust removal
});
```

### 5. JSONB Fields
```typescript
// Store complex objects as JSON
metricVisibilitySettings: jsonb('metric_visibility_settings').default({
  showActiveMembers: true,
  showWealthGeneration: true,
  showTrustNetwork: true,
  showCouncilActivity: true,
  showNeedsFulfillment: true,
  showDisputeRate: true
}),

// Array of UUIDs as JSON
disputeHandlingCouncils: jsonb('dispute_handling_councils').default([]),
pollCreatorUsers: jsonb('poll_creator_users').default([]),
```

## Schema Index File

Centralize all schema exports:

```typescript
// api/src/db/schema/index.ts
export * from './appUsers.schema';
export * from './communities.schema';
export * from './communityMembers.schema';
export * from './trustAwards.schema';
export * from './trustView.schema';
export * from './wealth.schema';
export * from './councils.schema';
export * from './forums.schema';
export * from './polls.schema';
export * from './invites.schema';
// ... etc
```

## Migration Workflow

### 1. Generate Migration
After modifying schema files:

```bash
bun drizzle-kit generate
```

This creates a new migration file in `api/src/db/migrations/`:
- `XXXX_description.sql` - The SQL migration file
- `meta/XXXX_snapshot.json` - Schema snapshot
- `meta/_journal.json` - Migration history

### 2. Review Migration
Always review generated SQL before applying:

```sql
-- api/src/db/migrations/0000_brainy_robin_chapel.sql
CREATE TYPE "public"."wealth_status" AS ENUM('active', 'fulfilled', 'expired', 'cancelled');

CREATE TABLE "communities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "min_trust_to_award_trust" jsonb DEFAULT '{"type":"number","value":15}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "deleted_at" timestamp
);

CREATE TABLE "resource_memberships" (
  "resource_id" uuid NOT NULL,
  "resource_type" text NOT NULL,
  "user_id" text NOT NULL,
  "role" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "resource_memberships"
  ADD CONSTRAINT "resource_memberships_resource_id_communities_id_fk"
  FOREIGN KEY ("resource_id") REFERENCES "communities"("id")
  ON DELETE cascade;
```

### 3. Apply Migration
Run migrations programmatically or via CLI:

```typescript
// api/src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations complete');
  await sql.end();
}

main();
```

Or run via command:
```bash
bun run migrate
```

## Database Connection

```typescript
// api/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

export const connection = postgres(connectionString);
export const db = drizzle(connection, { schema });
```

## Common Column Types

```typescript
// Text types
text('column_name')                          // Unlimited text
varchar('column_name', { length: 100 })      // Variable length with max

// Numeric types
integer('column_name')                       // Integer
serial('column_name')                        // Auto-increment integer
real('column_name')                          // Floating point
numeric('column_name', { precision: 10, scale: 2 }) // Decimal

// UUID
uuid('column_name')                          // UUID
uuid('column_name').defaultRandom()          // Auto-generate UUID

// Boolean
boolean('column_name')                       // Boolean
boolean('column_name').default(false)        // With default

// Timestamps
timestamp('column_name')                     // Timestamp
timestamp('column_name').defaultNow()        // Auto-set to now
timestamp('column_name', { withTimezone: true }) // With timezone

// JSON
json('column_name')                          // JSON
jsonb('column_name')                         // JSONB (indexed)
jsonb('column_name').default({ ... })        // With default

// Enums
pgEnum('enum_name', ['value1', 'value2'])    // Define enum type
```

## Constraints

```typescript
// Primary Key
.primaryKey()

// Not Null
.notNull()

// Unique
.unique()

// Default Value
.default(value)
.defaultNow()
.defaultRandom()

// Foreign Key
.references(() => otherTable.column, {
  onDelete: 'cascade',    // or 'set null', 'restrict', 'no action'
  onUpdate: 'cascade'
})

// Composite Primary Key
primaryKey({ columns: [table.col1, table.col2] })
```

## Best Practices

1. **Soft Deletes**: Always include `deletedAt` timestamp for recoverable deletion
2. **Audit Fields**: Include `createdAt`, `updatedAt`, `createdBy` for tracking
3. **Foreign Keys**: Set appropriate `onDelete` cascade behavior
4. **UUIDs for IDs**: Use UUIDs for primary keys (except app_users which uses Keycloak ID)
5. **Enums for Status**: Use PostgreSQL enums for status fields
6. **JSONB for Flexibility**: Use JSONB for configuration objects
7. **Index Planning**: Add indexes for frequently queried columns
8. **Naming Conventions**: Use snake_case for database columns
9. **Migration Safety**: Always review generated SQL before applying
10. **Type Safety**: Export types from schema for use in repositories

## Schema Organization

Organize schema files by feature:

```
api/src/db/schema/
├── index.ts                    # Central export
├── appUsers.schema.ts          # User profiles
├── communities.schema.ts       # Communities
├── communityMembers.schema.ts  # Memberships
├── trustAwards.schema.ts       # Trust relationships
├── trustView.schema.ts         # Trust score view
├── wealth.schema.ts            # Wealth items
├── councils.schema.ts          # Councils
├── forums.schema.ts            # Forum system
├── polls.schema.ts             # Polls and voting
└── invites.schema.ts           # Invite system
```

## Drizzle Studio

View and edit database with GUI:

```bash
bun drizzle-kit studio
```

Opens web interface at `https://local.drizzle.studio`

## Related Skills
- `api-repository` - Using schemas in repositories
- `api-service` - Business logic with database operations
- `api-testing` - Database testing patterns

## Feature Documentation
Before creating database schemas, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- Required database tables
- Table relationships
- Column requirements
- Implementation status (implemented vs planned)
