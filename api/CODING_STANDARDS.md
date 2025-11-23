# API Coding Standards

This document outlines coding conventions and best practices for the API codebase.

## Import Conventions

### ✅ Use Relative Imports

**Always use relative imports instead of path aliases** (`@/*`, `@services/*`, etc.)

```typescript
// ✅ CORRECT - Use relative imports
import { userService } from '../../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateUser } from '../validators/user.validator';

// ❌ INCORRECT - Don't use path aliases
import { userService } from '@/services/user.service';
import { AuthenticatedRequest } from '@/api/middleware/auth.middleware';
import { validateUser } from '@api/validators/user.validator';
```

**Why?**

- Bun (our runtime) doesn't reliably resolve TypeScript path mappings at runtime in Docker
- Path aliases work during bundling but fail at runtime
- Relative imports work consistently everywhere (development, Docker, production)

### Import Patterns by File Location

#### In Route Files (`src/api/routes/*.ts`)

```typescript
// Controllers (same level, different folder)
import { userController } from '../controllers/user.controller';

// Validators (same level, different folder)
import { validateCreateUser } from '../validators/user.validator';

// Middleware (same level, different folder)
import { verifyToken } from '../middleware/auth.middleware';

// Services (two levels up, different folder)
import { userService } from '../../services/user.service';
```

#### In Controller Files (`src/api/controllers/*.ts`)

```typescript
// Services (two levels up)
import { userService } from '../../services/user.service';

// Types (two levels up)
import { AuthenticatedRequest } from '../../types/auth.types';

// Utils (two levels up)
import { ApiResponse } from '../../utils/response';
import logger from '../../utils/logger';
```

#### In Service Files (`src/services/*.ts`)

```typescript
// Repositories (same level)
import { userRepository } from '../repositories/user.repository';

// Config (same level)
import { openfgaConfig } from '../config/openfga.config';

// Types (same level)
import { CreateUserDto } from '../types/user.types';

// Utils (same level)
import { AppError } from '../utils/errors';
```

## Project Structure Reference

```
api/
├── src/
│   ├── api/                    # HTTP layer
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Route definitions
│   │   ├── validators/         # Request validation
│   │   └── middleware/         # Express middleware
│   ├── services/               # Business logic
│   ├── repositories/           # Data access
│   ├── db/                     # Database
│   │   ├── schema/             # Drizzle schemas
│   │   └── migrations/         # SQL migrations
│   ├── config/                 # Configuration
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utilities
│   ├── jobs/                   # Cron jobs
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
```

## TypeScript Configuration

While we have path aliases configured in `tsconfig.json` for editor support, **do not rely on them in import statements**.

```json
// tsconfig.json - These are for EDITOR SUPPORT ONLY
{
  "paths": {
    "@/*": ["src/*"],
    "@api/*": ["src/api/*"],
    // ... etc
  }
}
```

The path mappings help with:
- IDE autocomplete
- Type checking
- Refactoring tools

But they **do not work** at runtime without additional configuration.

## ESLint Configuration (Future)

We plan to add an ESLint rule to prevent path alias usage:

```json
// .eslintrc.json (planned)
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@/*"]
      }
    ]
  }
}
```

## Package Manager

**Always use Bun**, never npm, yarn, or pnpm.

```bash
# ✅ CORRECT
bun install
bun add express
bun run dev

# ❌ INCORRECT
npm install
npm install express
npm run dev
```

## Common Patterns

### Repository Pattern

```typescript
// repositories/user.repository.ts
export const userRepository = {
  async findById(id: string) {
    // Implementation
  },
  async create(data: CreateUserDto) {
    // Implementation
  },
};
```

### Service Pattern

```typescript
// services/user.service.ts
import { userRepository } from '../repositories/user.repository';

export const userService = {
  async getUser(id: string) {
    return userRepository.findById(id);
  },
};
```

### Controller Pattern

```typescript
// api/controllers/user.controller.ts
import { Request, Response } from 'express';
import { userService } from '../../services/user.service';
import { ApiResponse } from '../../utils/response';

export const userController = {
  async getUser(req: Request, res: Response) {
    const user = await userService.getUser(req.params.id);
    res.json(ApiResponse.success(user));
  },
};
```

### Route Pattern

```typescript
// api/routes/user.routes.ts
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { validateGetUser } from '../validators/user.validator';

const router = Router();

router.get('/users/:id', verifyToken, validateGetUser, userController.getUser);

export default router;
```

## Testing Standards

### Test File Location

Place test files next to the code they test:

```
services/
├── user.service.ts
└── user.service.test.ts
```

### Test Imports

Use the same relative import conventions in tests:

```typescript
// user.service.test.ts
import { userService } from './user.service';
import { userRepository } from '../repositories/user.repository';
```

## Error Handling

### Use AppError for Business Logic Errors

```typescript
import { AppError } from '../../utils/errors';

if (!user) {
  throw new AppError('User not found', 404);
}
```

### Controller Error Handling

Controllers should let errors bubble up to the global error handler:

```typescript
export const userController = {
  async getUser(req: Request, res: Response) {
    // No try/catch - let errors bubble up
    const user = await userService.getUser(req.params.id);
    res.json(ApiResponse.success(user));
  },
};
```

## Database Operations

### Use Drizzle ORM

```typescript
import { db } from '../db';
import { users } from '../db/schema';

const user = await db.select().from(users).where(eq(users.id, id));
```

### Migrations

```bash
# Generate migration
bun run db:generate

# Push schema changes
bun run db:push

# View database in Studio
bun run db:studio
```

## Authorization

### All Authorization via OpenFGA

**Never implement authorization logic in application code.** Always use OpenFGA service:

```typescript
import { openfgaService } from '../../services/openfga.service';

// Check permission
const canEdit = await openfgaService.check({
  user: userId,
  relation: 'editor',
  object: `community:${communityId}`,
});

if (!canEdit) {
  throw new AppError('Forbidden', 403);
}
```

## Logging

Use the logger utility:

```typescript
import logger from '../../utils/logger';

logger.info('User created', { userId });
logger.error('Failed to create user', { error });
```

## Response Format

Use ApiResponse utility for consistent responses:

```typescript
import { ApiResponse } from '../../utils/response';

// Success
res.json(ApiResponse.success(data));

// Success with message
res.json(ApiResponse.success(data, 'User created successfully'));

// Error (handled by global error handler)
throw new AppError('Validation failed', 400);
```

## Future Improvements

- Add ESLint configuration to enforce import conventions
- Add pre-commit hooks to check for path alias usage
- Consider using a bundler that supports runtime path mapping
- Add automated tests for import conventions
