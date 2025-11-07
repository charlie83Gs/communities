---
name: api-controller
description: This skill teaches the agent how to implement the controller layer in the API project. MANDATORY - You MUST read this skill before modifying any controller files.
---

# API Controller Layer Skill

## Purpose
This skill covers the controller layer of the API project - the HTTP request/response handling layer that delegates to services for business logic and provides API documentation.

## When to Use This Skill
- Adding new API endpoints
- Handling HTTP request/response flow
- Adding Swagger documentation
- Managing authentication/authorization middleware
- Parsing and validating request parameters

## Key Patterns from Codebase

### 1. Controller Structure with Swagger Documentation
```typescript
// api/src/api/controllers/community.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types/auth.types';
import { communityService } from '@/services/community.service';
import { ApiResponse } from '@/utils/response';
import logger from '@/utils/logger';

/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: Community management endpoints
 */
class CommunityController {
  /**
   * @swagger
   * /api/v1/communities:
   *   post:
   *     summary: Create a new community
   *     tags: [Communities]
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
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Community created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Community'
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.session!.userId;
      const community = await communityService.createCommunity(req.body, userId);

      logger.info("Community created", { communityId: community.id, userId });
      return ApiResponse.created(res, community, "Community created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}:
   *   get:
   *     summary: Get community by ID
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Community details
   *       404:
   *         description: Community not found
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.session?.userId; // Optional for public communities

      const community = await communityService.getCommunityById(id, userId);
      return ApiResponse.success(res, community);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities:
   *   get:
   *     summary: List communities
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *     responses:
   *       200:
   *         description: List of communities
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 rows:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Community'
   *                 total:
   *                   type: integer
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = 0, limit = 20 } = req.query;
      const userId = req.session?.userId;

      const result = await communityService.listCommunities(
        Number(page),
        Number(limit),
        userId
      );

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const communityController = new CommunityController();
```

### 2. Using ApiResponse Utility
```typescript
import { ApiResponse } from '@/utils/response';

// Success responses
ApiResponse.success(res, data); // 200
ApiResponse.created(res, data, "Resource created"); // 201
ApiResponse.noContent(res); // 204

// Error responses are handled by error middleware
// Just throw AppError from service layer
```

### 3. Controller with Complex Query Parameters
```typescript
/**
 * @swagger
 * /api/v1/communities/search:
 *   get:
 *     summary: Search communities
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 */
async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { q, page = 0, limit = 20 } = req.query;
    const userId = req.session?.userId;

    const result = await communityService.searchCommunities({
      query: q as string,
      page: Number(page),
      limit: Number(limit),
      userId
    });

    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}
```

### 4. Controller with Path and Body Parameters
```typescript
/**
 * @swagger
 * /api/v1/communities/{id}/members/{userId}:
 *   put:
 *     summary: Update member role
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 64
 */
async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id, userId: targetUserId } = req.params;
    const { role } = req.body;
    const actorUserId = req.session!.userId;

    await communityService.updateMemberRole(id, targetUserId, role, actorUserId);
    return ApiResponse.success(res, null, "Member role updated");
  } catch (error) {
    next(error);
  }
}
```

### 5. Delete Endpoint
```typescript
/**
 * @swagger
 * /api/v1/communities/{id}:
 *   delete:
 *     summary: Delete a community
 *     tags: [Communities]
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
 *       204:
 *         description: Community deleted successfully
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Community not found
 */
async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.session!.userId;

    await communityService.deleteCommunity(id, userId);
    logger.info("Community deleted via API", { communityId: id, userId });
    return ApiResponse.noContent(res);
  } catch (error) {
    next(error);
  }
}
```

## Swagger Schema Definitions

Define reusable schemas in your Swagger configuration:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
```

## Key Principles

1. **No Business Logic**: Controllers only orchestrate, never implement logic
2. **Thin Layer**: Extract userId from session, call service, return response
3. **Error Handling**: Always use try-catch and pass errors to next()
4. **Swagger Documentation**: Every endpoint must have complete JSDoc @swagger
5. **Logging**: Log significant actions (create, update, delete) with context
6. **Type Safety**: Use AuthenticatedRequest for protected routes
7. **Consistent Responses**: Always use ApiResponse utility
8. **Parameter Extraction**: Parse query/params/body, validate in middleware

## Controller Testing

Controllers are tested indirectly through integration tests. Focus on service layer unit tests.

## Related Skills
- `api-service` - Business logic layer
- `api-routes` - Route definitions
- `api-validators` - Request validation
- `api-testing` - Integration testing

## Feature Documentation
Before implementing controller endpoints, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- API endpoint requirements
- Request/response formats
- Authorization requirements
- Related endpoints
