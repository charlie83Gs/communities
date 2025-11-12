# Directive

This project uses specialized agents make sure to ALWAYS use the correct agent when working with the api and frontend services.

For the api folder always use the express agent
For the frontend folder always to use the solid.js agent

## Parallel request

You can parallelize tasks that you consider adequate starting both the solid.js and express agent at the same time. But pass an agreement as part of the agent prompts, so if there is an api change for example the frontend agent builds for the params and return values that the backend will actually return.

## Package Manager - Bun Only

**CRITICAL:** This is a Bun project. ALWAYS use `bun` or `bunx` commands, NEVER use `npm`, `npx`, `yarn`, or `pnpm`.

### Common Command Examples

#### API (Backend - ./api)
```bash
# Install dependencies
bun install

# Install a new package
bun add <package-name>
bun add -d <package-name>  # dev dependency

# Run scripts
bun run dev
bun run build
bun run start

# Run tests
bun test
bun test --watch
bun test <specific-test-file>

# Type checking
bunx tsc --noEmit

# Linting
bun run lint
bun run lint:fix

# Database migrations (Drizzle ORM)
bun run drizzle-kit generate
bun run drizzle-kit migrate
bun run drizzle-kit studio
```

#### Frontend (./frontend)
```bash
# Install dependencies
bun install

# Install a new package
bun add <package-name>
bun add -d <package-name>  # dev dependency

# Run scripts
bun run dev
bun run build
bun run preview

# Type checking
bunx tsc --noEmit

# Linting
bun run lint
bun run lint:fix
```

#### Global Tools
```bash
# Execute packages without installing (like npx)
bunx <command>

# Examples:
bunx tsc --noEmit
bunx drizzle-kit generate
bunx prettier --write .
```

### Why Bun?
- Bun is a fast all-in-one JavaScript runtime and toolkit
- Drop-in replacement for Node.js with built-in bundler, test runner, and package manager
- This project uses Bun for both backend (API) and frontend
- Package manager is faster than npm/yarn/pnpm
- Compatible with npm packages but uses bun.lockb instead of package-lock.json

## Feature Documentation Requirements

**CRITICAL:** Before implementing or modifying any feature, you MUST:

1. **Read Affected Feature Docs First (MANDATORY)**
   - Locate the relevant feature documentation in `docs/features/`
   - Read the PRIMARY feature being modified/implemented
   - Understand the current implementation status (implemented/partial/planned)
   - Review the database tables (both implemented and planned)
   - **FAILURE TO READ THE AFFECTED FEATURE DOCS = FAILED IMPLEMENTATION**

2. **Review Related Features (RECOMMENDED)**
   - Check the `related_features` field in the feature metadata
   - Read related feature docs if they may be impacted by your changes
   - Use your judgment to determine which related features are relevant
   - This is optional but helps avoid breaking dependencies

3. **Update Feature Docs Before Code Changes (MANDATORY)**
   - For ANY modification that affects functionality, update the feature docs FIRST
   - Update the `last_updated` date in the metadata
   - Update implementation status if changing from planned → partial → implemented
   - Update database tables sections if schema changes
   - Update related features list if dependencies change
   - **NEVER modify code without updating docs first**

4. **Feature Documentation Location**
   - Main index: `docs/features/README.md`
   - Individual features: `docs/features/[FT-##]-[name].md`
   - Feature IDs: FT-01 through FT-13
   - Each feature has metadata with status, related features, and database tables

5. **Workflow for Implementation Tasks**
   ```
   Step 1: Read affected feature docs (MANDATORY)
   Step 2: Review related features if needed (RECOMMENDED - use judgment)
   Step 3: Update feature docs if modifying functionality (MANDATORY)
   Step 4: Implement code changes
   Step 5: Verify implementation matches updated docs
   ```

## System Overview

This system enables communities to manage shared resources, trust relationships, and collaborative decision-making without monetary transactions.

For detailed information about features, see `docs/features/README.md`.

## Core Features Summary

The system includes 13 core features organized into 4 categories:

### Core Features (FT-01 to FT-03)
- **FT-01: Communities** - Base organizational unit (Status: Implemented)
- **FT-02: Members & Permissions** - Dual permission model (Status: Implemented)
- **FT-03: Trust System** - Peer-to-peer trust system (Status: Implemented)

### Resource Management (FT-04 to FT-08)
- **FT-04: Wealth Sharing** - Resource sharing and requests (Status: Partial)
- **FT-05: Pools** - Resource aggregation (Status: Planned)
- **FT-06: Councils** - Specialized community actors (Status: Partial)
- **FT-08: Needs System** - Resource requirement planning (Status: Planned)

### Community Engagement (FT-07, FT-10, FT-11)
- **FT-07: Voting & Polling** - Collective decision-making (Status: Implemented)
- **FT-10: Forum System** - Community discussions (Status: Partial)
- **FT-11: Invite System** - Community growth (Status: Implemented)

### Administration (FT-09, FT-12, FT-13)
- **FT-09: Analytics & Statistics** - Community health metrics (Status: Planned)
- **FT-12: Configuration** - Per-community settings (Status: Implemented)
- **FT-13: Security & Access Control** - OpenFGA authorization (Status: Implemented)

**For detailed feature information, see `docs/features/README.md` and individual feature documents.**

## Key Architectural Concepts

### Dual Permission Model
- Members gain access through **role assignment** OR **trust threshold**
- Two paths: Role-Based (admin grants) or Trust-Based (automatic at threshold)
- Hybrid evaluation: OpenFGA checks both simultaneously

### Trust System
- Trust score = number of community members who trust the user
- Members can award/remove trust (tracked in trust_awards table)
- Admins can bootstrap with admin-granted trust (auditable)
- Trust levels sync to OpenFGA for permission checks

### Security & Authorization
- **All authorization via OpenFGA** - NO auth logic in app code
- Roles stored as OpenFGA relations (e.g., `community#admin`, `council#member`)
- Trust-based access via `trust_level_X` relations
- Real-time sync: trust changes immediately update OpenFGA relations

### Database Schema Key Points
- `communities` - All configuration stored here (trust thresholds, forum settings, etc.)
- `community_members` - User memberships (NO role column, roles in OpenFGA)
- `trust_awards` - Peer-to-peer trust (simple award model)
- `admin_trust_grants` - Admin-granted trust (separate, auditable)
- `trust_history` - Complete audit log of trust changes
- Councils have their own trust system (council_trust_awards, council_trust_scores)

**For complete details on any feature, refer to `docs/features/[FT-##]-[name].md`**

## Common Trust Configuration Fields

Stored in `communities` table as JSONB with structure `{ type: 'number', value: X }`:

- `minTrustToAwardTrust` (default: 15) - Award trust to others
- `minTrustForWealth` (default: 10) - Publish/share wealth
- `minTrustForPolls` (default: 15) - Create polls
- `minTrustForDisputes` (default: 20) - Handle disputes
- `minTrustForPoolCreation` (default: 20) - Create pools (planned feature)
- `minTrustForCouncilCreation` (default: 25) - Create councils
- `minTrustForForumModeration` (default: 30) - Full forum moderation
- `minTrustForThreadCreation` (default: 10) - Create forum threads
- `minTrustForAttachments` (default: 15) - Upload forum attachments
- `minTrustForFlagging` (default: 15) - Flag forum content
- `minTrustForFlagReview` (default: 30) - Review flagged content
- `minTrustForItemManagement` (default: 20) - Manage community items
- `minTrustForHealthAnalytics` (default: 20) - View health analytics

## Implementation Examples & Use Cases

For detailed use cases and implementation examples, see individual feature documents in `docs/features/`:
- User workflows and scenarios
- Step-by-step implementation guides
- Common patterns and best practices
