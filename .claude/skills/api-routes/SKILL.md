---
name: api-routes
description: This skill teaches the agent how to implement routing in the API project. MANDATORY - You MUST read this skill before modifying any route files.
---

# API Routes Skill

## Purpose
This skill covers the routing layer of the API project - defining URL endpoints, attaching middleware, and mapping HTTP methods to controller actions.

## When to Use This Skill
- Defining new API endpoints
- Organizing route structure
- Attaching authentication middleware
- Applying validation middleware
- Setting up public vs protected routes

## Key Patterns from Codebase

### 1. Basic Route Structure
```typescript
// api/src/api/routes/community.routes.ts
import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { communityController } from '../controllers/community.controller';
import {
  validateCreateCommunity,
  validateUpdateCommunity,
  validateGetCommunity,
  validateListCommunities,
} from '../validators/community.validator';

const router = Router();

/**
 * Public endpoints (no auth required or optional auth):
 * - GET / (list communities, shows public + user-accessible if token present)
 * - GET /search (search with filters)
 * - GET /:id (view community details)
 */
router.get(
  '/',
  verifyTokenOptional,  // Optional auth: attaches session if token present
  validateListCommunities,
  communityController.list
);

router.get(
  '/search',
  verifyTokenOptional,
  validateCommunitySearchQuery,
  communityController.search
);

router.get(
  '/:id',
  verifyTokenOptional,
  validateGetCommunity,
  communityController.getById
);

/**
 * Authenticated endpoints (session required, global permissions):
 * - POST / (create community - any authenticated user can create)
 */
router.post(
  '/',
  verifyToken,  // Required auth: must have valid token
  validateCreateCommunity,
  communityController.create
);

/**
 * Protected endpoints (auth + business-rule checks in service):
 * - PUT /:id (update community - admin only, checked in service)
 * - DELETE /:id (delete community - admin only, checked in service)
 */
router.put(
  '/:id',
  verifyToken,
  validateUpdateCommunity,
  communityController.update
);

router.delete(
  '/:id',
  verifyToken,
  communityController.delete
);

export default router;
```

### 2. Nested Resource Routes
```typescript
/**
 * Members endpoints (nested under community):
 * - GET /:id/members (list members)
 * - GET /:id/members/:userId (get specific member)
 * - DELETE /:id/members/:userId (remove member)
 * - PUT /:id/members/:userId (update member role)
 */
router.get(
  '/:id/members',
  verifyToken,
  validateGetMembers,
  communityController.getMembers
);

router.get(
  '/:id/members/:userId',
  verifyToken,
  validateGetMemberById,
  communityController.getMemberById
);

router.delete(
  '/:id/members/:userId',
  verifyToken,
  validateRemoveMember,
  communityController.removeMember
);

router.put(
  '/:id/members/:userId',
  verifyToken,
  validateUpdateMemberRole,
  communityController.updateMemberRole
);
```

### 3. Route Ordering (Important!)
```typescript
// CORRECT: Specific routes before parameterized routes
router.get('/search', verifyTokenOptional, validateSearch, controller.search);
router.get('/:id', verifyTokenOptional, validateGetById, controller.getById);

// WRONG: Parameterized route will catch '/search' as an id
router.get('/:id', verifyTokenOptional, validateGetById, controller.getById);
router.get('/search', verifyTokenOptional, validateSearch, controller.search);
```

### 4. Main Routes Registration
```typescript
// api/src/app.ts or api/src/routes/index.ts
import { Router } from 'express';
import communityRoutes from './community.routes';
import trustRoutes from './trust.routes';
import wealthRoutes from './wealth.routes';
import userRoutes from './users.routes';

const router = Router();

// Register all route modules
router.use('/communities', communityRoutes);
router.use('/trust', trustRoutes);
router.use('/wealth', wealthRoutes);
router.use('/users', userRoutes);

export default router;
```

### 5. Trust Routes Example
```typescript
// api/src/api/routes/trust.routes.ts
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { trustController } from '../controllers/trust.controller';
import {
  validateAwardTrust,
  validateRemoveTrust,
  validateGetTrustScore,
} from '../validators/trust.validator';

const router = Router();

/**
 * Trust management endpoints:
 * - POST /communities/:communityId/trust/:userId (award trust)
 * - DELETE /communities/:communityId/trust/:userId (remove trust)
 * - GET /communities/:communityId/trust/:userId (get trust score)
 */
router.post(
  '/communities/:communityId/trust/:userId',
  verifyToken,
  validateAwardTrust,
  trustController.awardTrust
);

router.delete(
  '/communities/:communityId/trust/:userId',
  verifyToken,
  validateRemoveTrust,
  trustController.removeTrust
);

router.get(
  '/communities/:communityId/trust/:userId',
  verifyToken,
  validateGetTrustScore,
  trustController.getTrustScore
);

export default router;
```

### 6. Wealth Routes Example
```typescript
// api/src/api/routes/wealth.routes.ts
import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { wealthController } from '../controllers/wealth.controller';
import {
  validateCreateWealth,
  validateUpdateWealth,
  validateGetWealth,
  validateSearchWealth,
} from '../validators/wealth.validator';

const router = Router();

// Public/optional auth endpoints
router.get(
  '/search',
  verifyTokenOptional,
  validateSearchWealth,
  wealthController.search
);

router.get(
  '/:id',
  verifyTokenOptional,
  validateGetWealth,
  wealthController.getById
);

// Protected endpoints
router.post(
  '/',
  verifyToken,
  validateCreateWealth,
  wealthController.create
);

router.put(
  '/:id',
  verifyToken,
  validateUpdateWealth,
  wealthController.update
);

router.delete(
  '/:id',
  verifyToken,
  wealthController.delete
);

// Wealth requests
router.post(
  '/:id/request',
  verifyToken,
  validateCreateRequest,
  wealthController.createRequest
);

router.put(
  '/:id/request/:requestId',
  verifyToken,
  validateUpdateRequest,
  wealthController.updateRequest
);

export default router;
```

## Middleware Chain Order

The order of middleware matters:

```typescript
router.post(
  '/path',
  verifyToken,              // 1. Authentication (sets req.session)
  validateRequest,          // 2. Validation (validates req.body/params/query)
  controller.method         // 3. Controller (handles business logic)
);
```

## Authentication Middleware

### verifyToken (Required Auth)
- Validates JWT from Authorization header
- Attaches `req.session` with userId, email, etc.
- Returns 401 if token is missing or invalid
- Use for all protected endpoints

```typescript
router.post('/', verifyToken, validateCreate, controller.create);
```

### verifyTokenOptional (Optional Auth)
- Validates JWT if present
- Attaches `req.session` if token is valid
- Does NOT return 401 if token is missing
- Use for public endpoints that show different data for authenticated users

```typescript
router.get('/', verifyTokenOptional, validateList, controller.list);
```

## URL Structure Best Practices

1. **Resource-Oriented**: `/api/v1/communities`, `/api/v1/wealth`
2. **Nested Resources**: `/api/v1/communities/:id/members`
3. **Actions as Routes**: `/api/v1/wealth/:id/request`, `/api/v1/trust/:id/award`
4. **Plural Nouns**: Use plural for collections (`/communities`, not `/community`)
5. **Lowercase**: All URLs lowercase with hyphens for multi-word resources
6. **Versioning**: Include version in path (`/api/v1/`)

## HTTP Method Usage

- **GET**: Retrieve data (idempotent, no side effects)
- **POST**: Create new resource or trigger action
- **PUT**: Update entire resource or specific field
- **PATCH**: Partial update (not commonly used in this codebase)
- **DELETE**: Remove resource (soft delete in most cases)

## Route Comments

Add clear comments explaining:
- Public vs authenticated routes
- Authorization model (RBAC in service vs global access)
- Special middleware requirements
- Nested resource relationships

```typescript
/**
 * Public endpoints (no RBAC):
 * - GET / (list public; if Authorization token present, also include user-accessible via membership/policies)
 * - GET /search (search with filters; public + user-accessible private if token present)
 * - GET /:id (public communities are open; private require session + explicit access handled in service)
 * Note: verifyTokenOptional attaches session when a valid token is provided,
 * allowing the controller to read req.session on public routes.
 */
```

## Common Route Patterns

### CRUD Pattern
```typescript
// Create
router.post('/', verifyToken, validateCreate, controller.create);

// Read (list)
router.get('/', verifyTokenOptional, validateList, controller.list);

// Read (single)
router.get('/:id', verifyTokenOptional, validateGetById, controller.getById);

// Update
router.put('/:id', verifyToken, validateUpdate, controller.update);

// Delete
router.delete('/:id', verifyToken, controller.delete);
```

### Search Pattern
```typescript
router.get('/search', verifyTokenOptional, validateSearch, controller.search);
```

### Nested Resource Pattern
```typescript
// Parent resource
router.get('/:id', verifyToken, validateGetById, controller.getById);

// Nested collection
router.get('/:id/children', verifyToken, validateGetChildren, controller.getChildren);

// Nested item
router.get('/:id/children/:childId', verifyToken, validateGetChild, controller.getChild);
```

### Action Pattern
```typescript
// Trigger an action on a resource
router.post('/:id/action-name', verifyToken, validateAction, controller.performAction);

// Examples:
router.post('/:id/request', verifyToken, validateRequest, controller.createRequest);
router.post('/:id/award', verifyToken, validateAward, controller.awardTrust);
```

## Related Skills
- `api-controller` - Controller methods
- `api-validators` - Request validation middleware
- `api-testing` - Integration testing routes

## Feature Documentation
Before implementing routes, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- Required endpoints
- Public vs protected endpoints
- Authorization requirements
- URL structure conventions
