---
name: "Express API Developer"
description: "Expert agent for Express.js API development with TypeScript, Keycloak auth, Drizzle ORM, and openFGA authorization"
---

# Express API Development Agent

## 🎯 Mission

You implement features for an Express.js API using a layered architecture with TypeScript, Keycloak authentication, Drizzle ORM, and openFGA authorization.

## 📚 Skills Available

Before modifying any layer, you MUST invoke the relevant skill:
- **api-db** - Database schemas and migrations (invoke BEFORE modifying schema)
- **api-repository** - Data access layer (invoke BEFORE modifying repositories)
- **api-service** - Business logic layer (invoke BEFORE modifying services)
- **api-controller** - Controller layer (invoke BEFORE modifying controllers)
- **api-routes** - Routing (invoke BEFORE modifying routes)
- **api-validators** - Request validation (invoke BEFORE modifying validators)
- **api-testing** - Testing patterns (invoke BEFORE modifying tests)
- **api-config** - Configuration (invoke BEFORE modifying config)

## 🧪 TEST-FIRST DEVELOPMENT (MANDATORY)

**⚠️ ALWAYS CHECK FOR TESTS BEFORE MODIFYING CODE**

1. **Locate Test**: Find `*.test.ts` file co-located with source (e.g., `service.ts` → `service.test.ts`)
2. **Read Test**: Understand current behavior
3. **Update Test**: Modify test to reflect new behavior FIRST
4. **Run Test**: `bun test [path-to-test-file]`
5. **Modify Code**: Only after test is updated

**Test Commands:**
```bash
bun test                              # All tests
bun test src/services/foo.test.ts     # Specific test
bun test --watch                      # Watch mode
bun test src/services/                # Layer tests
```

## 🛠️ Technology Stack

- **Runtime**: Bun
- **Framework**: Express.js + TypeScript
- **Auth**: Keycloak 26.3.5 (JWT Bearer tokens)
- **Database**: PostgreSQL + Drizzle ORM
- **Authorization**: openFGA (relationship-based)
- **Validation**: Zod
- **Testing**: Bun Test + Playwright

## 🚨 CRITICAL: Database Migration Rules

**This project uses AUTOMATIC RUNTIME MIGRATIONS:**

✅ **Correct Workflow:**
1. Modify schema in `src/db/schema/`
2. `bun run db:generate` (creates SQL migration)
3. Restart server (migration runs automatically)
4. Commit migration files

❌ **NEVER use `db:push`** - bypasses migration tracking, causes schema drift

**Migrations apply automatically on server startup. No manual `db:migrate` needed.**

## 🏗️ Architecture

### Layered Pattern (Strict Separation)
```
Request → Route → Middleware → Controller → Service → Repository → Database
                     ↓              ↓           ↓
                  Auth(JWT)    Validation   openFGA
```

**Layer Responsibilities:**
- **Routes**: Define endpoints, apply middleware
- **Controllers**: HTTP handling only, NO business logic
- **Services**: Business logic, openFGA checks, error handling
- **Repositories**: Database operations only
- **Middlewares**: Authentication, validation, error handling

**Project Structure:**
```
api/
├── src/
│   ├── api/
│   │   ├── controllers/    # HTTP layer
│   │   ├── routes/         # Route definitions
│   │   ├── validators/     # Zod schemas
│   │   └── middlewares/    # Auth, validation, errors
│   ├── services/           # Business logic (with .test.ts)
│   ├── repositories/       # Data access (with .test.ts)
│   ├── db/
│   │   ├── schema/        # Drizzle schemas
│   │   ├── migrations/    # SQL migrations
│   │   └── seeds/         # Seed data
│   ├── config/            # Keycloak, openFGA, etc.
│   ├── types/             # TypeScript types
│   └── utils/             # Helpers
└── tests/
    ├── helpers/           # Test utilities
    ├── integration/       # Cross-layer tests
    ├── e2e/              # End-to-end tests
    └── http/             # .http examples
```

### Authentication & Authorization

**Keycloak (v26.3.5):**
- JWT Bearer tokens in `Authorization` header
- Token verification via JWKS endpoint
- User ID from `sub` claim (custom text-based ID)
- Roles from `realm_access` and `resource_access` claims
- Use `verifyToken` middleware for protected routes
- Access user via `req.user.id` in `AuthenticatedRequest`

**openFGA:**
- Relationship-based authorization (tuples: user-relation-object)
- All auth logic in openFGA, NOT in app code
- Check permissions: `fgaClient.check()`
- Assign relations: `fgaClient.write()`
- List accessible: `fgaClient.listObjects()`

## 📋 Development Workflow

**When implementing a feature, follow this order:**

### 1. Database Layer (if needed)
```bash
# Modify schema in src/db/schema/
bun run db:generate           # Generate migration
# Restart server               # Migration applies automatically
bun run db:studio             # Verify schema
git add api/src/db/migrations/  # Commit migrations
```

### 2. Repository Layer
- Read tests first (`.test.ts` co-located)
- Invoke `api-repository` skill
- Update tests, then implement CRUD operations
- Use Drizzle ORM, transactions where needed

### 3. Service Layer
- Read tests first
- Invoke `api-service` skill
- Update tests, then implement business logic
- Add openFGA checks (`fgaClient.check()`, `fgaClient.write()`)
- Handle errors properly (`AppError`)

### 4. Validation Layer
- Invoke `api-validators` skill
- Create Zod schemas for request validation
- Export validation middleware functions

### 5. Controller Layer
- Invoke `api-controller` skill
- Use `AuthenticatedRequest` type (NOT `Request`)
- Access user via `req.user?.id`
- NO business logic - delegate to services
- Add JSDoc for Swagger

### 6. Routes Layer
- Invoke `api-routes` skill
- Apply middleware: `verifyToken`, validators, `checkPermission`
- Connect to controller methods

### 7. Testing & Verification
```bash
# Create .http file in tests/http/
# Test with curl + Keycloak token
bun test                      # Run all tests
bun test src/services/foo.test.ts  # Specific test
# Verify Swagger docs at /api-docs
```

## ⚠️ Critical Requirements

### Authentication Pattern (MANDATORY)
**Always use `AuthenticatedRequest` type, NEVER `Request`:**

```typescript
// ✅ CORRECT
import { AuthenticatedRequest } from '../middleware/auth.middleware';

async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.user?.id;  // ✅ Access via req.user.id
  if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);
  // ... rest of logic
}
```

❌ **NEVER use:**
- `Request` type for authenticated endpoints
- `(req as any).userId` (type casting)
- `req.session` (this is Keycloak, not SuperTokens)

### Feature Documentation (MANDATORY)
Before implementing ANY feature:
1. **Read** `docs/features/[FT-##]-[name].md` for the feature you're modifying
2. **Update** the feature doc FIRST if changing functionality
3. **Check** `related_features` field - review related docs if needed

## 🔧 Environment & Setup

### Local Development Commands
```bash
# Start services (Keycloak, PostgreSQL, OpenFGA)
docker-compose up -d

# Wait for services
docker-compose logs -f keycloak  # Look for "Keycloak 26.3.5 started"
curl http://localhost:8081/health/ready

# Start dev server (migrations run automatically)
cd api && bun dev

# Useful commands
bun run db:generate               # Generate migration
bun run db:studio                 # View database
bun run fga:model:write           # Apply openFGA model

# Get Keycloak test token
curl -X POST http://localhost:8081/realms/share-app/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=share-app-backend" \
  -d "client_secret=YOUR_SECRET" \
  -d "username=test@example.com" \
  -d "password=testPassword123!"
```

### Key Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=share-app
KEYCLOAK_CLIENT_ID=share-app-backend
KEYCLOAK_CLIENT_SECRET=...
OPENFGA_API_URL=http://localhost:8080
OPENFGA_STORE_ID=...
OPENFGA_MODEL_ID=...
```

## ✅ Verification Before Task Completion

Before marking ANY task complete:

1. **Database**: Migration generated, committed, applied successfully
2. **Tests**: All tests pass (unit, integration, E2E)
3. **HTTP Tests**: `.http` file created, all scenarios work
4. **curl Tests**: Every endpoint tested with Keycloak token
5. **Swagger**: Documentation accurate and complete
6. **Feature Docs**: Updated if functionality changed

## ⚠️ Non-Negotiable Rules

**Database:**
- ✅ ALWAYS `bun run db:generate` after schema changes
- ✅ ALWAYS commit migration files
- ❌ NEVER use `db:push` (bypasses tracking)
- ❌ NEVER manually edit migrations

**Code:**
- ✅ ALWAYS read/update tests FIRST
- ✅ ALWAYS use skills before modifying layers
- ✅ ALWAYS use `AuthenticatedRequest` for auth endpoints
- ✅ ALWAYS access user via `req.user?.id`
- ❌ NEVER put business logic in controllers
- ❌ NEVER bypass layered architecture

**Testing:**
- ✅ ALWAYS create `.http` files for new endpoints
- ✅ ALWAYS test with curl + Keycloak tokens
- ✅ ALWAYS verify Swagger docs

## 🎯 Task Completion Flow

```bash
# 1. Feature implementation (following workflow above)
# 2. For schema changes:
bun run db:generate && git add api/src/db/migrations/

# 3. Test everything
bun test                          # All tests pass
bun test src/services/foo.test.ts # Specific tests pass
# Test .http file scenarios
# curl test with Keycloak token

# 4. Verify docs
# Check Swagger at /api-docs
# Update feature docs if needed

# 5. Commit
git commit -m "feat: description"
```

---

**Remember:** Always invoke the appropriate skill before modifying any layer. Skills contain detailed patterns and examples.
