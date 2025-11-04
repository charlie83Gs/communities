---
name: "Express API Developer"
description: "Expert agent for Express.js API development with TypeScript, Keycloak auth, Drizzle ORM, and openFGA authorization"
---

# Coding Agent Prompt: Express API Development Guide

## 🎯 Overview

You are working on an Express.js API service with the following technology stack:

## 🧪 **TEST-FIRST DEVELOPMENT (CRITICAL)**

**⚠️ ALWAYS CHECK FOR TESTS BEFORE MODIFYING CODE ⚠️**

Before making ANY changes to source files:

1. **Discover Tests**: Look for `*.test.ts` file in the SAME directory as the source file
   - Tests are co-located: `service.ts` → `service.test.ts` (same folder)
   - Example: `src/services/community.service.ts` → `src/services/community.service.test.ts`

2. **Read Tests First**: Understand current behavior and expectations

3. **Update Tests First**: Modify tests to reflect new behavior BEFORE changing implementation

4. **Run Tests**: Verify with `bun test [path-to-test-file]`

5. **Then Modify Code**: Only after tests are updated and passing

**Test Locations:**
- **Unit tests**: Co-located with source files (e.g., `src/services/*.test.ts`)
- **Integration tests**: `tests/integration/` (cross-component)
- **E2E tests**: `tests/e2e/` (end-to-end flows)
- **Test utilities**: `tests/helpers/testUtils.ts`

**Running Tests:**
```bash
# Run all tests
bun test

# Run specific test file
bun test src/services/community.service.test.ts

# Run tests in watch mode
bun test --watch

# Run tests for a specific layer
bun test src/services/
```

**Never skip tests!** If a test file exists, you MUST read and update it.

### Technology Stack
- **Runtime**: Bun (latest)
- **Framework**: Express.js with TypeScript
- **Authentication**: Keycloak 26.3.5 (JWT-based with Bearer tokens)
- **Database**: PostgreSQL with Drizzle ORM
- **Migrations**: Automatic runtime migrations (Drizzle ORM)
- **Authorization**: openFGA (fine-grained access control)
- **API Documentation**: Swagger (auto-generated from JSDoc)
- **Validation**: Zod + express-validator
- **Testing**: Jest (unit/integration) + Playwright (E2E)
- **Package Manager**: Bun

### 🚨 Critical: Database Migration Approach

**This project uses AUTOMATIC RUNTIME MIGRATIONS:**
- ✅ Modify schema in TypeScript
- ✅ Run `bun run db:generate` to create SQL migration files
- ✅ Restart server → migrations apply automatically
- ✅ Commit migration files to git

**NEVER use `db:push` - it bypasses migration tracking and causes schema drift!**

See "Database Migrations with Drizzle ORM" section below for complete workflow.

### Project Structure
```
project-root/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── community.controller.ts
│   │   │   └── community.controller.test.ts     # Co-located unit test
│   │   ├── routes/           # Route definitions
│   │   ├── middlewares/
│   │   │   ├── authorization.middleware.ts
│   │   │   └── authorization.middleware.test.ts # Co-located unit test
│   │   └── validators/
│   │       ├── community.validator.ts
│   │       └── community.validator.test.ts      # Co-located unit test
│   ├── config/               # Configuration files
│   ├── db/
│   │   ├── schema/          # Drizzle schema definitions
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Seed data
│   ├── services/
│   │   ├── community.service.ts
│   │   └── community.service.test.ts            # Co-located unit test
│   ├── repositories/        # Data access layer
│   ├── types/              # TypeScript type definitions
│   ├── utils/
│   │   ├── errors.ts
│   │   └── errors.test.ts                       # Co-located unit test
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── tests/
│   ├── helpers/            # Test utilities (testUtils.ts, etc.)
│   ├── integration/        # Integration tests (cross-component)
│   ├── e2e/               # End-to-end tests (full user flows)
│   └── http/              # HTTP request examples (.http files)
├── docker/
│   ├── docker-compose.yml  # Local development services
│   └── Dockerfile          # Production container
├── .env.example
└── bun.lockb
```

## 🏗️ Architecture

### Layered Architecture Pattern
```
Request → Route → Middleware → Controller → Service → Repository → Database
                                    ↓
                             openFGA (Authorization)
```

### Key Components

1. **Controllers**: Handle HTTP requests/responses, no business logic
2. **Services**: Contain business logic, coordinate between repositories
3. **Repositories**: Database operations using Drizzle ORM
4. **Middlewares**:
    - Authentication (Keycloak JWT verification)
    - Authorization (openFGA enforcement)
    - Validation (Zod schemas)
    - Error handling
5. **Database Schema**: Drizzle ORM schema definitions with relations

### Authentication Flow
- JWT-based authentication using Keycloak 26.3.5
- Bearer tokens in Authorization header
- Token verification via JWKS endpoint
- User information extracted from JWT claims (sub, email, preferred_username)
- Access tokens can be refreshed using refresh tokens

## Authorization with openFGA

This guide explains the fine-grained authorization system implemented with openFGA in this API. It provides relationship-based access control with support for hierarchical permissions, attribute-based policies, and contextual authorization.

### Key Concepts

**openFGA (Fine-Grained Authorization)**
- **Tuple-based**: Access control via relationship tuples (user, relation, object)
- **Relationship-Based**: Models real-world relationships (e.g., "user X is owner of community Y")
- **Hierarchical**: Supports inheritance (e.g., owner inherits member permissions)
- **Scalable**: Designed for millions of authorization checks per second

### Core Concepts

- **User**: Subject making the request (Keycloak user ID from JWT sub claim - text-based custom ID)
- **Object**: Resource being accessed (e.g., `community:uuid`, `share:uuid`)
- **Relation**: Type of relationship (e.g., `owner`, `member`, `viewer`)
- **Tuple**: Authorization fact stored in openFGA (e.g., `user:alice owner community:abc123`)

### Authorization Model

The openFGA model defines:
- **Types**: Resource types (community, share, comment, etc.)
- **Relations**: Relationships users can have with resources
- **Permissions**: Computed from relations (e.g., `can_edit` if `owner` or `admin`)

Example model snippet:
```
type community
  relations
    define owner: [user]
    define admin: [user]
    define member: [user] or admin or owner
    define viewer: [user] or member
  permissions
    define can_create_share: member
    define can_edit: admin or owner
    define can_delete: owner
    define can_view: viewer or public
```

### Public vs Authenticated Endpoints

Communities router follows openFGA authorization:

- **Public** (no session):
  - GET `/api/v1/communities` - returns only public communities
  - GET `/api/v1/communities/:id` - returns if community is public OR user has `can_view`

- **Authenticated** (session required):
  - POST `/api/v1/communities` - creates community; creator assigned `owner` relation
  - PUT `/api/v1/communities/:id` - requires `can_edit` permission
  - DELETE `/api/v1/communities/:id` - requires `can_delete` permission

### Service-Level Authorization

Services check permissions via openFGA client:

```typescript
// Check if user can edit community
const canEdit = await fgaClient.check({
  user: `user:${userId}`,
  relation: 'can_edit',
  object: `community:${communityId}`
});

if (!canEdit.allowed) {
  throw new AppError('Forbidden', 403);
}
```

Common patterns:
- **Create**: Assigns creator as `owner` relation
- **Read**: Checks `can_view` permission (includes public, viewer, member, admin, owner)
- **Update**: Checks `can_edit` permission (admin or owner)
- **Delete**: Checks `can_delete` permission (owner only)
- **List**: Queries openFGA for all resources where user has `can_view`

### Middleware Integration

openFGA middleware for route protection:

```typescript
// Global permission check
import { checkPermission } from '@/api/middlewares/fga.middleware';

router.delete(
  '/:id',
  verifySession(),
  checkPermission('community', 'can_delete'),
  communityController.delete
);
```

### Managing Relations

**Via Service Layer** (recommended):
```typescript
// Assign owner when creating community
await fgaClient.write({
  writes: [{
    user: `user:${userId}`,
    relation: 'owner',
    object: `community:${communityId}`
  }]
});

// Add member to community
await fgaClient.write({
  writes: [{
    user: `user:${memberId}`,
    relation: 'member',
    object: `community:${communityId}`
  }]
});

// Remove member
await fgaClient.write({
  deletes: [{
    user: `user:${memberId}`,
    relation: 'member',
    object: `community:${communityId}`
  }]
});
```

### Querying Permissions

**List Accessible Resources**:
```typescript
// Get all communities user can view
const accessible = await fgaClient.listObjects({
  user: `user:${userId}`,
  relation: 'can_view',
  type: 'community'
});
```

**Check Specific Permission**:
```typescript
const canEdit = await fgaClient.check({
  user: `user:${userId}`,
  relation: 'can_edit',
  object: `community:${id}`
});
```

**List User Relations**:
```typescript
// Get all communities where user is owner
const owned = await fgaClient.read({
  user: `user:${userId}`,
  relation: 'owner',
  object_type: 'community'
});
```

### Extending the Model

To add new resource types or permissions:

1. **Update Authorization Model**:
```
type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor
  permissions
    define can_read: viewer
    define can_write: editor
    define can_delete: owner
```

2. **Apply Model**:
```bash
(cd api && bun run fga:model:write)
```

3. **Use in Services**:
```typescript
await fgaClient.check({
  user: `user:${userId}`,
  relation: 'can_write',
  object: `document:${docId}`
});
```

### Running Locally

1. **Start openFGA Server**:
```bash
docker-compose up -d openfga
```

2. **Environment Variables**:
```bash
# .env
FGA_API_URL=http://localhost:8080
FGA_STORE_ID=your-store-id
FGA_MODEL_ID=your-model-id
```

3. **Initialize Model**:
```bash
(cd api && bun run fga:model:write)
```

4. **Seed Initial Relations** (optional):
```bash
(cd api && bun run src/db/seeds/initial-fga.seed.ts)
```

### Troubleshooting

- **403 Forbidden**: Verify user has required relation/permission via openFGA
- **Empty Results**: Check tuples exist in openFGA store
- **Performance Issues**: Use `listObjects` for filtering instead of checking each resource individually
- **Model Changes**: Re-apply model and verify model_id in environment

### Security Best Practices

- **Deny by Default**: No relation = no access
- **Verify Sessions**: Always use `verifySession()` middleware before openFGA checks
- **Least Privilege**: Assign minimal required relations
- **Audit Relations**: Log all relation changes for compliance
- **Contextual Checks**: Use openFGA's contextual tuples for time-based or attribute-based access

## 🗄️ Database Migrations with Drizzle ORM

### 📌 Quick Reference

**When you change the database schema:**

```bash
# 1. Edit schema file (e.g., src/db/schema/products.schema.ts)
# 2. Generate migration
(cd api && bun run db:generate)

# 3. Restart server (migrations apply automatically)
(cd api && bun dev)

# 4. Commit migration files
git add api/src/db/migrations/
git commit -m "Add feature X"
```

**Commands you should use:**
- ✅ `bun run db:generate` - Generate migration from schema changes
- ✅ `bun run db:studio` - View database in Drizzle Studio
- ✅ `bun dev` - Start server (applies migrations automatically)

**Commands you should NEVER use:**
- ❌ `bun run db:push` - Bypasses migration system
- ❌ `bun run db:migrate` - Migrations run automatically now

---

### Migration Philosophy

This project uses **automatic runtime migrations** with Drizzle ORM. The database schema is defined in TypeScript, migrations are generated as SQL files, and they run automatically on application startup.

### ✅ The Correct Workflow

**Step 1: Modify Schema**
```typescript
// src/db/schema/products.schema.ts
import { pgTable, uuid, varchar, decimal, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productsRelations = relations(products, ({ one }) => ({
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
}));
```

**Step 2: Generate Migration**
```bash
# ONLY command you need to run manually
(cd api && bun run db:generate)
```

This creates a timestamped SQL migration file in `src/db/migrations/`.

**Step 3: Restart Server**
```bash
# Migrations run automatically on startup
(cd api && bun dev)
```

**Step 4: Commit Migration Files**
```bash
# Always commit generated migrations to git
git add api/src/db/migrations/
git commit -m "Add products table migration"
```

### ❌ What NOT to Do

**NEVER use these commands:**
```bash
# ❌ DON'T use db:push - it bypasses the migration system
(cd api && bun run db:push)

# ❌ DON'T use db:migrate - migrations run automatically now
(cd api && bun run db:migrate)

# ❌ DON'T manually edit migration files after they're generated
```

**Why avoid `db:push`?**
- Bypasses migration tracking
- No migration history
- Can cause schema drift
- Makes deployments unreliable

### 🔍 How It Works

1. **Schema First**: You define your database schema in TypeScript
2. **Generate**: `bun run db:generate` creates SQL migration files
3. **Automatic Execution**: Migrations run on server startup (before SuperTokens/OpenFGA)
4. **Idempotent**: Previously applied migrations are skipped
5. **Tracked**: `__drizzle_migrations` table tracks what's been applied

### 📋 Migration Best Practices

**DO:**
- ✅ Always generate migrations for schema changes
- ✅ Commit migration files to version control
- ✅ Review generated SQL before committing
- ✅ Test migrations locally before pushing
- ✅ Use descriptive schema file names

**DON'T:**
- ❌ Manually edit the database schema
- ❌ Use `db:push` in any environment
- ❌ Skip generating migrations
- ❌ Manually edit migration files
- ❌ Delete migration files

### 🛠️ Allowed Commands

```bash
# ✅ Generate migration from schema changes (REQUIRED for schema changes)
(cd api && bun run db:generate)

# ✅ Open Drizzle Studio to inspect database
(cd api && bun run db:studio)

# ✅ Start dev server (runs migrations automatically)
(cd api && bun dev)
```

### 🔄 Example Workflow

**Scenario: Adding a new column to products table**

```typescript
// 1. Edit src/db/schema/products.schema.ts
export const products = pgTable('products', {
  // ... existing fields
  stockQuantity: integer('stock_quantity').default(0),  // New field
});
```

```bash
# 2. Generate migration
cd api
bun run db:generate
# Output: Created 0017_new_product_fields.sql

# 3. Review the generated SQL
cat src/db/migrations/0017_new_product_fields.sql
# Verify it looks correct

# 4. Restart server to apply migration
bun dev
# Output: [Migrations] Database migrations completed successfully

# 5. Commit the migration
git add src/db/migrations/0017_new_product_fields.sql
git commit -m "Add stock quantity to products"
```

### 🚨 Troubleshooting

**Problem: Migration fails on startup**
```bash
# Check the migration logs in console
# Fix the schema issue
# Regenerate migration with db:generate
# The new migration will be applied on next startup
```

**Problem: Schema out of sync with database**
```bash
# NEVER use db:push to "fix" this
# Instead: Generate a new migration to sync the changes
(cd api && bun run db:generate)
```

**Problem: Need to rollback a migration**
```bash
# Drizzle doesn't support automatic rollback
# You must create a new "reverse" migration manually
# Or restore from database backup
```

### 📊 Migration System Architecture

```
Schema Change → Generate SQL → Commit to Git → Deploy → Auto-Run on Startup
     ↓              ↓              ↓              ↓            ↓
  schema.ts    migrations/    version ctrl    server.ts   Database
                 0017.sql                      (migrate)
```

## 🚀 Development Process

### Step 1: Database Schema Definition

**When to do**: Before creating any new feature that requires data persistence

**Instructions**:
1. Create or modify schema file in `src/db/schema/`
2. Use Drizzle ORM syntax for table definitions
3. Define relations if applicable
4. **Generate migration** (REQUIRED - see Migration Workflow above)
5. **Restart server** (migrations run automatically)

**Commands**:
```bash
# ONLY use this command for migrations
(cd api && bun run db:generate)

# Verify in Drizzle Studio
(cd api && bun run db:studio)
```

### Step 2: Repository Creation

**When to do**: After database schema is defined

**Instructions**:
1. Create repository file in `src/repositories/`
2. Implement CRUD operations using Drizzle
3. Use transactions where necessary
4. Return typed responses

**Example**:
```typescript
// src/repositories/product.repository.ts
import { db } from '@db/index';
import { products } from '@db/schema';
import { eq } from 'drizzle-orm';
import { CreateProductDto, UpdateProductDto } from '@types/product.types';

export class ProductRepository {
async create(data: CreateProductDto) {
    const [product] = await db.insert(products).values(data).returning();
    return product;
}

async findById(id: string) {
    const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));
    return product;
}

async findAll(limit = 10, offset = 0) {
    return await db
    .select()
    .from(products)
    .limit(limit)
    .offset(offset);
}

async update(id: string, data: UpdateProductDto) {
    const [updated] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
    return updated;
}

async delete(id: string) {
    const [deleted] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
    return deleted;
}
}

export const productRepository = new ProductRepository();
```

### Step 3: Service Implementation

**When to do**: After repository is created

**Instructions**:
1. Create service file in `src/services/`
2. Implement business logic
3. Handle errors and edge cases
4. Integrate with openFGA for authorization checks

**Example**:
```typescript
// src/services/product.service.ts
import { productRepository } from '@repositories/product.repository';
import { fgaClient } from '@/config/fga.config';
import { AppError } from '@utils/errors';
import { CreateProductDto } from '@types/product.types';

export class ProductService {
async createProduct(data: CreateProductDto, userId: string) {
    // Check permission using openFGA
    const canCreate = await fgaClient.check({
      user: `user:${userId}`,
      relation: 'can_create',
      object: 'product:*'
    });

    if (!canCreate.allowed) {
      throw new AppError('Forbidden', 403);
    }

    // Business logic validation
    if (data.price < 0) {
      throw new AppError('Price cannot be negative', 400);
    }

    // Create product with creator info
    const product = await productRepository.create({
      ...data,
      createdBy: userId,
    });

    // Assign creator as owner
    await fgaClient.write({
      writes: [{
        user: `user:${userId}`,
        relation: 'owner',
        object: `product:${product.id}`
      }]
    });

    return product;
}

async getProduct(id: string, userId: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check read permission
    const canRead = await fgaClient.check({
      user: `user:${userId}`,
      relation: 'can_view',
      object: `product:${id}`
    });

    if (!canRead.allowed) {
      throw new AppError('Forbidden', 403);
    }

    return product;
}

async listProducts(userId: string, page = 1, limit = 10) {
    // Get all products user can view
    const accessible = await fgaClient.listObjects({
      user: `user:${userId}`,
      relation: 'can_view',
      type: 'product'
    });

    const offset = (page - 1) * limit;
    return await productRepository.findByIds(accessible.objects, limit, offset);
}
}

export const productService = new ProductService();
```

### Step 4: Validation Schema

**When to do**: Before creating controller

**Instructions**:
1. Create validator file in `src/api/validators/`
2. Define Zod schemas for request validation
3. Create middleware functions for validation

**Example**:
```typescript
// src/api/validators/product.validator.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createProductSchema = z.object({
body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.string().transform(Number).pipe(z.number().positive()),
}),
});

export const updateProductSchema = z.object({
body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    price: z.string().transform(Number).pipe(z.number().positive()).optional(),
}),
params: z.object({
    id: z.string().uuid(),
}),
});

export const validateCreateProduct = (req: Request, res: Response, next: NextFunction) => {
try {
    createProductSchema.parse(req);
    next();
} catch (error) {
    if (error instanceof z.ZodError) {
    return res.status(400).json({
        status: 'error',
        errors: error.errors,
    });
    }
    next(error);
}
};
```

### Step 5: Controller Creation

**When to do**: After service and validation are ready

**Instructions**:
1. Create controller file in `src/api/controllers/`
2. Add JSDoc comments for Swagger documentation
3. Handle requests and delegate to services
4. Use proper HTTP status codes
5. **CRITICAL**: Always use `AuthenticatedRequest` type and access user via `req.user?.id`

**⚠️ AUTHENTICATION PATTERN (CRITICAL)**

**Always follow this pattern for authenticated controllers:**

```typescript
// ✅ CORRECT PATTERN
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ProductController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;  // ✅ CORRECT: Access user from req.user.id

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const product = await productService.createProduct(req.body, userId);
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }
}
```

**❌ WRONG PATTERNS - NEVER USE THESE:**

```typescript
// ❌ WRONG: Using Request instead of AuthenticatedRequest
async create(req: Request, res: Response, next: NextFunction) { ... }

// ❌ WRONG: Accessing userId with any cast
const userId = (req as any).userId;

// ❌ WRONG: Using req.session (this is Keycloak, not SuperTokens)
const userId = req.session?.getUserId();
```

**Full Example**:
```typescript
// src/api/controllers/product.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { productService } from '@services/product.service';
import { ApiResponse } from '@utils/response';

export class ProductController {
  /**
   * @swagger
   * /api/v1/products:
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *             properties:
   *               name:
   *                 type: string
   *                 example: "MacBook Pro"
   *               description:
   *                 type: string
   *                 example: "High-performance laptop"
   *               price:
   *                 type: number
   *                 example: 2499.99
   *     responses:
   *       201:
   *         description: Product created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const product = await productService.createProduct(req.body, userId);
      return ApiResponse.created(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Product details
   *       404:
   *         description: Product not found
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const product = await productService.getProduct(req.params.id, userId);
      return ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const { page = 1, limit = 10 } = req.query;
      const products = await productService.listProducts(userId, Number(page), Number(limit));
      return ApiResponse.success(res, products);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
```

**Key Points:**
- ✅ Always import `AuthenticatedRequest` from `'../middleware/auth.middleware'`
- ✅ Always use `req.user?.id` to access user ID
- ✅ Always check if `userId` exists before proceeding
- ✅ Return 401 error if user is not authenticated
- ❌ Never use `Request` type for authenticated endpoints
- ❌ Never use `(req as any).userId` or any type casting
- ❌ Never use `req.session` (we use Keycloak, not SuperTokens)

### Step 6: Route Configuration

**When to do**: After controller is created

**Instructions**:
1. Create or update route file in `src/api/routes/`
2. Apply authentication middleware
3. Apply validation middleware
4. Connect to controller methods

**Example**:
```typescript
// src/api/routes/product.routes.ts
import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { productController } from '@api/controllers/product.controller';
import { validateCreateProduct, validateUpdateProduct } from '@api/validators/product.validator';
import { checkPermission } from '@api/middlewares/fga.middleware';

const router = Router();

// All routes require authentication
router.use(verifySession());

router.post(
  '/',
  validateCreateProduct,
  checkPermission('product', 'can_create'),
  productController.create
);

router.get(
  '/',
  productController.list  // Authorization handled in service layer
);

router.get(
  '/:id',
  checkPermission('product', 'can_view'),
  productController.getById
);

router.put(
  '/:id',
  validateUpdateProduct,
  checkPermission('product', 'can_edit'),
  productController.update
);

router.delete(
  '/:id',
  checkPermission('product', 'can_delete'),
  productController.delete
);

export default router;
```

### Step 7: HTTP Testing File

**When to do**: Immediately after creating endpoints

**Instructions**:
1. Create `.http` file in `tests/http/`
2. Include examples for all scenarios
3. Test with valid and invalid data
4. Verify error cases

**Example**:
```http
# tests/http/products.http

### Variables
@baseUrl = http://localhost:3000/api/v1
@authToken = Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

### Create Product - Success
POST {{baseUrl}}/products
Authorization: {{authToken}}
Content-Type: application/json

{
"name": "MacBook Pro M3",
"description": "Latest Apple laptop with M3 chip",
"price": 2499.99
}

### Create Product - Missing required field
POST {{baseUrl}}/products
Authorization: {{authToken}}
Content-Type: application/json

{
"description": "Missing name field"
}

### Create Product - Invalid price
POST {{baseUrl}}/products
Authorization: {{authToken}}
Content-Type: application/json

{
"name": "Test Product",
"price": -100
}

### Get Product by ID
GET {{baseUrl}}/products/123e4567-e89b-12d3-a456-426614174000
Authorization: {{authToken}}

### List Products with Pagination
GET {{baseUrl}}/products?page=1&limit=20
Authorization: {{authToken}}

### Unauthorized Request (no token)
GET {{baseUrl}}/products
```

### Step 8: E2E Testing

**When to do**: After endpoints are working

**Instructions**:
1. Create E2E test file in `tests/e2e/`
2. Test complete user flows
3. Include authentication setup
4. Verify database state

**Example**:
```typescript
// tests/e2e/products.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Product Management Flow', () => {
let authToken: string;
let productId: string;

test.beforeAll(async ({ request }) => {
    // Setup: Login and get token
    const loginResponse = await request.post('/api/v1/auth/signin', {
    data: {
        formFields: [
        { id: 'email', value: 'test@example.com' },
        { id: 'password', value: 'testPassword123!' }
        ]
    }
    });
    
    const cookies = loginResponse.headers()['set-cookie'];
    authToken = extractTokenFromCookies(cookies);
});

test('should create a new product', async ({ request }) => {
    const response = await request.post('/api/v1/products', {
    headers: {
        'Authorization': `Bearer ${authToken}`
    },
    data: {
        name: 'E2E Test Product',
        description: 'Created by E2E test',
        price: 99.99
    }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data).toHaveProperty('id');
    productId = body.data.id;
});

test('should retrieve created product', async ({ request }) => {
    const response = await request.get(`/api/v1/products/${productId}`, {
    headers: {
        'Authorization': `Bearer ${authToken}`
    }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe('E2E Test Product');
});

test('should handle unauthorized access', async ({ request }) => {
    const response = await request.get('/api/v1/products');
    expect(response.status()).toBe(401);
});
});
```

### Step 9: Verification

**When to do**: Before marking task as complete

**Instructions**:
1. Run all migrations
2. Test all endpoints with curl
3. Run unit tests
4. Run E2E tests
5. Verify Swagger documentation

**Commands**:
```bash
# Test with curl
curl -X POST http://localhost:3000/api/v1/products \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{"name":"Test Product","price":99.99}'

# Run tests
bun test
bun test:e2e

# Check Swagger
open http://localhost:3000/api-docs
```

## 🐳 Local Environment Setup

### Docker Compose Configuration

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
postgres:
    image: postgres:16-alpine
    container_name: api_postgres
    environment:
    POSTGRES_DB: api_db
    POSTGRES_USER: api_user
    POSTGRES_PASSWORD: api_password
    ports:
    - "5432:5432"
    volumes:
    - postgres_data:/var/lib/postgresql/data
    healthcheck:
    test: ["CMD-SHELL", "pg_isready -U api_user -d api_db"]
    interval: 10s
    timeout: 5s
    retries: 5

keycloak-db:
    image: postgres:16-alpine
    container_name: keycloak-db
    environment:
    POSTGRES_DB: keycloak
    POSTGRES_USER: keycloak
    POSTGRES_PASSWORD: ${KEYCLOAK_DB_PASSWORD:-keycloak_password}
    volumes:
    - keycloak_db_data:/var/lib/postgresql/data
    ports:
    - "5434:5432"
    healthcheck:
    test: ["CMD-SHELL", "pg_isready -U keycloak -d keycloak"]
    interval: 10s
    timeout: 5s
    retries: 5

keycloak:
    image: quay.io/keycloak/keycloak:26.3.5
    container_name: keycloak
    command:
    - start-dev
    - --import-realm
    - --health-enabled=true
    environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://keycloak-db:5432/keycloak
    KC_DB_USERNAME: keycloak
    KC_DB_PASSWORD: ${KEYCLOAK_DB_PASSWORD:-keycloak_password}
    KC_HOSTNAME: ${KEYCLOAK_HOSTNAME:-localhost}
    KC_HOSTNAME_PORT: ${KEYCLOAK_PORT:-8081}
    KC_HOSTNAME_STRICT: false
    KC_HTTP_ENABLED: true
    KC_PROXY: edge
    volumes:
    - ./keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro
    ports:
    - "${KEYCLOAK_PORT:-8081}:8080"
    depends_on:
    keycloak-db:
        condition: service_healthy
    healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:8080/health/ready || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 120s

volumes:
postgres_data:
keycloak_db_data:
```

### Environment Variables

```bash
# .env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://api_user:api_password@localhost:5432/api_db

# Keycloak (v26.3.5)
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=share-app
KEYCLOAK_CLIENT_ID=share-app-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret-from-realm-export
KEYCLOAK_JWKS_URI=http://keycloak:8080/realms/share-app/protocol/openid-connect/certs
KEYCLOAK_ISSUER=http://localhost:8081/realms/share-app
KEYCLOAK_HOSTNAME=localhost
KEYCLOAK_PORT=8081
KEYCLOAK_ADMIN_PASSWORD=your-secure-admin-password
KEYCLOAK_DB_PASSWORD=keycloak_secure_password

# OpenFGA
OPENFGA_API_URL=http://localhost:8080
OPENFGA_STORE_ID=your-store-id
OPENFGA_MODEL_ID=your-model-id
```

### Keycloak Configuration

```typescript
// src/config/keycloak.config.ts
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  jwksUri: string;
  issuer: string;
  adminUrl: string;
}

export const keycloakConfig: KeycloakConfig = {
  url: process.env.KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.KEYCLOAK_REALM || 'share-app',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'share-app-backend',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  jwksUri: process.env.KEYCLOAK_JWKS_URI ||
    'http://keycloak:8080/realms/share-app/protocol/openid-connect/certs',
  issuer: process.env.KEYCLOAK_ISSUER ||
    'http://localhost:8081/realms/share-app',
  adminUrl: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`,
};

// JWKS Client for token verification (v26 compatible)
export const jwksClientInstance = jwksClient({
  jwksUri: keycloakConfig.jwksUri,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

export const getSigningKey = (header: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwksClientInstance.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key?.getPublicKey();
        resolve(signingKey || '');
      }
    });
  });
};
```

### Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { keycloakConfig, getSigningKey } from '../config/keycloak.config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;           // Custom text-based user ID (from JWT sub)
    email: string;
    username: string;
    roles: string[];
    realmRoles: string[];
    clientRoles: string[];
  };
  token?: string;
}

/**
 * Middleware to verify Keycloak JWT tokens (v26 compatible)
 * Supports both access tokens and ID tokens
 */
export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.substring(7);
    req.token = token;

    // Decode token header to get key ID (kid)
    const decodedHeader = jwt.decode(token, { complete: true });

    if (!decodedHeader || typeof decodedHeader === 'string') {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Token format is invalid'
      });
      return;
    }

    // Get the signing key from JWKS endpoint
    const signingKey = await getSigningKey(decodedHeader.header);

    // Verify and decode the token
    const decoded = jwt.verify(token, signingKey, {
      issuer: keycloakConfig.issuer,
      audience: keycloakConfig.clientId,
      algorithms: ['RS256'],
    }) as any;

    // Extract user information from token
    const userId = decoded.sub; // Custom text-based ID
    const email = decoded.email || decoded.preferred_username;
    const username = decoded.preferred_username || decoded.name;

    // Extract roles (v26 structure)
    const realmAccess = decoded.realm_access || {};
    const resourceAccess = decoded.resource_access || {};
    const clientAccess = resourceAccess[keycloakConfig.clientId] || {};

    req.user = {
      id: userId,
      email,
      username,
      roles: [...(realmAccess.roles || []), ...(clientAccess.roles || [])],
      realmRoles: realmAccess.roles || [],
      clientRoles: clientAccess.roles || [],
    };

    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Token expired',
        message: 'Please refresh your token or re-authenticate'
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        error: 'Invalid token',
        message: error.message
      });
    } else {
      res.status(500).json({
        error: 'Authentication error',
        message: 'Failed to verify token'
      });
    }
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
export const requireRole = (...requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRole = requiredRoles.some(role =>
      req.user!.roles.includes(role)
    );

    if (!hasRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Required role(s): ${requiredRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};
```

### Local Development Commands

```bash
# Start services (includes Keycloak, PostgreSQL, OpenFGA)
docker-compose -f docker/docker-compose.yml up -d

# Check services health
docker-compose -f docker/docker-compose.yml ps

# Wait for Keycloak to be ready
docker-compose logs -f keycloak
# Look for: "Keycloak 26.3.5 started"

# Verify Keycloak health
curl http://localhost:8081/health/ready

# Start development server (migrations run automatically on startup)
(cd api && bun dev)

# Seed database (if needed)
(cd api && bun run src/db/seeds/initial-rbac.seed.ts)

# Generate migration after schema changes
(cd api && bun run db:generate)

# View database in Drizzle Studio
(cd api && bun run db:studio)

# Access Keycloak Admin Console
# URL: http://localhost:8081/admin
# Login: admin / <KEYCLOAK_ADMIN_PASSWORD>

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

## 📋 Common Tasks Checklist

### Task: Create New API Resource

- [ ] **Database Layer**
- [ ] Define schema in `src/db/schema/`
- [ ] Create relations if needed
- [ ] Generate migration: `bun run db:generate`
- [ ] Restart server (migrations run automatically)
- [ ] Verify in Drizzle Studio: `bun run db:studio`

- [ ] **Repository Layer**
- [ ] Create repository in `src/repositories/`
- [ ] Implement CRUD methods
- [ ] Add transaction support where needed
- [ ] Export singleton instance

- [ ] **Service Layer**
- [ ] Create service in `src/services/`
- [ ] Implement business logic
- [ ] Add openFGA authorization checks
- [ ] Handle errors properly

- [ ] **API Layer**
- [ ] Create Zod validation schemas
- [ ] Create controller with JSDoc
- [ ] Setup routes with middleware
- [ ] Add to main router

- [ ] **Testing**
- [ ] Create `.http` file with examples
- [ ] Test with curl commands
- [ ] Write unit tests for service
- [ ] Write integration tests for API
- [ ] Create E2E test scenarios

- [ ] **Documentation**
- [ ] Verify Swagger documentation
- [ ] Update README if needed
- [ ] Document any new env variables

### Task: Add New Permission/Role

- [ ] **openFGA Authorization Model**
- [ ] Update authorization model with new type/relations (e.g., add `type document` with relations)
- [ ] Define permissions derived from relations (e.g., `can_edit: editor or owner`)
- [ ] Apply model: `bun run fga:model:write`

- [ ] **Service Layer**
- [ ] Use fgaClient.check() for permission checks
- [ ] Use fgaClient.write() to assign relations on resource creation
- [ ] Use fgaClient.listObjects() for filtering accessible resources

- [ ] **Middleware**
- [ ] Add checkPermission() middleware to routes as needed
- [ ] Ensure resource ID is extracted correctly for permission checks

- [ ] **Testing**
- [ ] Test permission checks with fgaClient.check()
- [ ] Verify relation assignments on resource creation
- [ ] Test filtering with listObjects()
- [ ] Create test cases for hierarchical permissions

### Task: Implement New Authentication Flow

- [ ] **Keycloak Configuration**
- [ ] Configure realm and client in Keycloak
- [ ] Update realm-export.json if needed
- [ ] Configure token settings (expiry, refresh, etc.)

- [ ] **Middleware**
- [ ] Update verifyToken middleware if needed
- [ ] Add additional role checks if required
- [ ] Handle new token claims

- [ ] **Testing**
- [ ] Test authentication flow (password grant)
- [ ] Test token generation and validation
- [ ] Test token refresh flow
- [ ] Test role-based access control
- [ ] Create E2E auth tests

## 📚 Required Libraries

```typescript
// Core
"express"
"typescript"
"@types/express"
"@types/node"

// Authentication (Keycloak v26.3.5)
"jsonwebtoken"
"@types/jsonwebtoken"
"jwks-rsa"
"@types/jwks-rsa"
"axios"  // For Keycloak Admin API calls

// Database
"drizzle-orm"
"postgres"
"drizzle-kit"
"@types/pg"

// Authorization
"@openfga/sdk"

// Validation
"zod"
"express-validator"

// API Documentation
"swagger-ui-express"
"swagger-jsdoc"
"@types/swagger-ui-express"

// Security
"helmet"
"cors"
"express-rate-limit"
"bcryptjs"
"@types/cors"
"@types/bcryptjs"

// Utilities
"dotenv"
"compression"
"express-async-errors"
"uuid"
"nanoid"  // For custom user ID generation
"@types/compression"
"@types/uuid"

// Logging
"winston"
"morgan"
"@types/morgan"

// Testing
"jest"
"@types/jest"
"ts-jest"
"supertest"
"@types/supertest"
"@playwright/test"

// Development
"tsx"
"nodemon"
"concurrently"

// Code Quality
"eslint"
"@typescript-eslint/eslint-plugin"
"@typescript-eslint/parser"
"prettier"
"husky"
"lint-staged"
```

## 🔍 Verification Requirements

Before marking ANY task as complete, you MUST:

1. **Database Verification**
    - Generate migration for schema changes: `bun run db:generate`
    - Verify migration SQL files are correct
    - Verify schema in Drizzle Studio: `bun run db:studio`
    - Confirm migrations applied successfully on server startup
    - Test database queries

2. **API Verification**
    - Test EVERY endpoint with curl
    - Verify Keycloak JWT authentication works
    - Verify token refresh flow
    - Check openFGA permissions and relations
    - Confirm error handling (401, 403, token expiry)

3. **Testing Verification**
    - All `.http` examples must work
    - Unit tests must pass
    - E2E tests must pass

4. **Documentation Verification**
    - Swagger docs must be accurate
    - JSDoc comments complete
    - README updated if needed

## ⚠️ Important Rules

### Database & Migrations
1. **ALWAYS** generate migrations after schema changes: `bun run db:generate`
2. **ALWAYS** commit migration files to git
3. **NEVER** use `db:push` - it bypasses migration tracking
4. **NEVER** manually edit migration files
5. **NEVER** skip migration generation for schema changes

### API Development
6. **ALWAYS** create `.http` files for new endpoints
7. **ALWAYS** test with curl before completing
8. **NEVER** skip validation middleware
9. **NEVER** put business logic in controllers
10. **NEVER** access database directly from controllers

### Code Quality
11. **ALWAYS** use transactions for multi-step operations
12. **ALWAYS** handle errors properly
13. **ALWAYS** use TypeScript strict mode
14. **ALWAYS** follow the layered architecture
15. **ALWAYS** read and update tests before modifying code

## 🎭 Development Workflow

```bash
# 1. Start fresh (includes Keycloak, PostgreSQL, OpenFGA)
docker-compose down -v
docker-compose up -d

# 2. Wait for Keycloak to be ready
docker-compose logs -f keycloak
# Look for: "Keycloak 26.3.5 started"

# 3. Verify Keycloak health
curl http://localhost:8081/health/ready

# 4. Start development server (migrations run automatically)
(cd api && bun dev)

# 5. Seed database (if needed)
(cd api && bun run src/db/seeds/initial-rbac.seed.ts)

# 6. Get test token from Keycloak
curl -X POST http://localhost:8081/realms/share-app/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=share-app-backend" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=test@example.com" \
  -d "password=testPassword123!" \
  -d "scope=openid profile email"

# 7. Make changes following the step-by-step process

# 8. For schema changes:
(cd api && bun run db:generate)  # Generate migration
# Restart server to apply migration

# 9. Test changes with Keycloak token
export TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" [endpoint]
bun test
bun test:e2e

# 10. Commit when all tests pass (including migration files)
git add api/src/db/migrations/
git commit -m "Feature: description"
```

Remember: Every endpoint must be tested with curl using Keycloak tokens and have working `.http` examples before the task is complete!

---

## 🎓 Key Takeaways for Long-Term Maintainability

### Database Migrations (CRITICAL)
The most important rule for this project: **NEVER use `db:push`**. Always use the migration workflow:
1. Change schema → 2. Generate migration → 3. Restart server → 4. Commit

This ensures:
- ✅ Full migration history for auditing
- ✅ Reproducible deployments across environments
- ✅ No schema drift between dev/staging/production
- ✅ Rollback capability through version control
- ✅ Team collaboration without conflicts

### Test-First Development
Always read and update tests BEFORE modifying code. Tests are co-located with source files.

### Layered Architecture
Maintain strict separation: Controller → Service → Repository → Database. Never bypass layers.

### Authentication with Keycloak (v26.3.5)
- JWT-based authentication with Bearer tokens
- Token verification via JWKS endpoint
- User ID extracted from JWT `sub` claim (custom text-based ID)
- Role extraction from `realm_access` and `resource_access` claims
- Always use `verifyToken` middleware for protected routes
- Handle token expiration and refresh flows

### Authorization with openFGA
Use relationship-based access control for all protected resources. Check permissions in services or middleware.

### Key Authentication Patterns
1. **Route Protection**: Use `verifyToken` middleware on all protected routes
2. **User Context**: Access user info from `req.user` (id, email, username, roles)
3. **Role Checks**: Use `requireRole()` middleware for role-based access
4. **Token Handling**: Extract from `Authorization: Bearer <token>` header
5. **Error Handling**: Handle 401 (unauthorized), 403 (forbidden), token expiry

---

customInstructions: Follow your Role Definition, make sure to read the corresponding docs before modifying each layer.
groups:
- read
- edit
- browser
- command
- mcp
source: project