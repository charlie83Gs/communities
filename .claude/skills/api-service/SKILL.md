---
name: api-service
description: This skill teaches the agent how to implement the business logic layer in the API project. MANDATORY - You MUST read this skill before modifying any service files.
---

# API Service Layer Skill

## Purpose
This skill covers the service layer of the API project - the business logic layer that orchestrates repositories, handles authorization, and manages complex transactions.

## When to Use This Skill
- Implementing new business features
- Orchestrating multiple data operations
- Adding OpenFGA authorization logic
- Managing complex transactions with rollback logic
- Validating business rules before data persistence

## Key Patterns from Codebase

### 1. Service Structure
```typescript
// api/src/services/community.service.ts
import { communityRepository } from '@/repositories/community.repository';
import { appUserRepository } from '@/repositories/appUser.repository';
import { openfgaService } from '@/services/openfga.service';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';

class CommunityService {
  async createCommunity(data: CreateCommunityDto, userId: string): Promise<Community> {
    // 1. Verify prerequisites
    const user = await appUserRepository.findById(userId);
    if (!user) {
      throw new AppError("User profile not found. Please complete registration.", 404);
    }

    // 2. Create main resource
    const community = await communityRepository.create({
      ...data,
      createdBy: userId
    });

    // 3. Critical: Handle related operations with rollback
    try {
      await communityMemberRepository.addMember(community.id, userId, "admin");
      await openfgaService.writeTuple({
        user: `user:${userId}`,
        relation: 'admin',
        object: `community:${community.id}`
      });
    } catch (err) {
      // Rollback on failure
      await communityRepository.delete(community.id);
      logger.error("Failed to assign admin role", { communityId: community.id, userId, error: err });
      throw new AppError("Failed to create community. Admin assignment failed.", 500);
    }

    return community;
  }
}

export const communityService = new CommunityService();
```

### 2. Authorization Checks (Using Permissions)
```typescript
// IMPORTANT: Always check PERMISSIONS, not roles
// The permission system automatically includes admin + feature roles + trust roles

async updateCommunity(id: string, data: UpdateCommunityDto, userId: string): Promise<Community> {
  // 1. Verify resource exists
  const community = await communityRepository.findById(id);
  if (!community) {
    throw new AppError("Community not found", 404);
  }

  // 2. Check permissions via OpenFGA - Use checkAccess()
  // This checks: admin OR has explicit update permission OR has trust-based update access
  const canUpdate = await openFGAService.checkAccess(
    userId,
    'community',  // Resource type
    id,           // Resource ID
    'update'      // Action (maps to 'can_update')
  );

  if (!canUpdate) {
    throw new AppError("You do not have permission to update this community", 403);
  }

  // 3. Perform update
  return await communityRepository.update(id, data);
}
```

**Why this pattern?**
- `checkAccess()` automatically checks all permission sources (admin + roles + trust)
- Action names map to permissions ('update' → 'can_update')
- Trust-based access is automatic (no manual trust checks needed)
- Cleaner, more maintainable code

### 3. Feature-Specific Permission Checks
```typescript
async manageForumCategory(
  categoryId: string,
  userId: string,
  action: 'update' | 'delete'
): Promise<void> {
  // 1. Get category and verify it exists
  const category = await forumRepository.findById(categoryId);
  if (!category) throw new AppError("Category not found", 404);

  // 2. Check feature-specific permission
  // This checks: admin OR forum_manager OR trust_forum_manager
  const canManage = await openFGAService.checkAccess(
    userId,
    'community',
    category.communityId,
    'can_manage_forum'  // Feature permission
  );

  if (!canManage) {
    throw new AppError("You do not have permission to manage forum categories", 403);
  }

  // 3. Perform action
  if (action === 'delete') {
    await forumRepository.delete(categoryId);
  }
}
```

### 4. Transaction Management with Multiple Repositories
```typescript
async shareWealthToCouncil(
  wealthId: string,
  councilId: string,
  userId: string
): Promise<WealthShare> {
  // 1. Verify all resources exist
  const wealth = await wealthRepository.findById(wealthId);
  if (!wealth) throw new AppError("Wealth item not found", 404);

  const council = await councilRepository.findById(councilId);
  if (!council) throw new AppError("Council not found", 404);

  // 2. Check authorization - Use permission, not manual trust check
  const canShare = await openFGAService.checkAccess(
    userId,
    'community',
    wealth.communityId,
    'can_create_wealth'  // Permission includes trust check automatically
  );

  if (!canShare) {
    throw new AppError("You do not have permission to share wealth", 403);
  }

  // 3. Create wealth share (auto-fulfilled for councils)
  const share = await wealthRepository.createShare({
    wealthId,
    targetType: 'council',
    targetId: councilId,
    status: 'fulfilled',
    fulfilledAt: new Date()
  });

  // 4. Update council inventory
  try {
    await councilRepository.addToInventory(councilId, {
      itemId: wealthId,
      quantity: wealth.quantity,
      sourceUserId: userId
    });
  } catch (err) {
    // Rollback the share if inventory update fails
    await wealthRepository.deleteShare(share.id);
    logger.error("Council inventory update failed", { shareId: share.id, error: err });
    throw new AppError("Failed to transfer wealth to council", 500);
  }

  return share;
}
```

### 5. Batch Operations
```typescript
async getUserCommunitiesWithRoles(userId: string): Promise<CommunityWithRole[]> {
  // 1. Get user memberships
  const memberships = await communityMemberRepository.findByUser(userId);
  const communityIds = memberships.map(m => m.resourceId);

  if (communityIds.length === 0) return [];

  // 2. Batch fetch communities
  const communities = await communityRepository.findByIds(communityIds);

  // 3. Fetch base roles from OpenFGA (parallel for performance)
  const rolePromises = communityIds.map(id =>
    openFGAService.getUserBaseRole(userId, 'community', id)
  );
  const roles = await Promise.all(rolePromises);

  // 4. Combine data
  return communities.map((community, index) => ({
    ...community,
    role: roles[index] // 'admin' | 'member' | null
  }));
}
```

### 6. Error Handling Best Practices
```typescript
async deleteCommunity(id: string, userId: string): Promise<void> {
  try {
    // 1. Verify exists
    const community = await communityRepository.findById(id);
    if (!community) {
      throw new AppError("Community not found", 404);
    }

    // 2. Check admin permission
    const isAdmin = await communityMemberRepository.isAdmin(id, userId);
    if (!isAdmin) {
      throw new AppError("Only admins can delete communities", 403);
    }

    // 3. Soft delete (cascading handled in repository)
    await communityRepository.delete(id);

    logger.info("Community deleted", { communityId: id, deletedBy: userId });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    logger.error("Unexpected error deleting community", { communityId: id, error: err });
    throw new AppError("Failed to delete community", 500);
  }
}
```

## Testing Services

Services should have comprehensive unit tests with mocked repositories:

```typescript
// api/src/services/community.service.test.ts
import { describe, it, expect, beforeEach, mock } from "bun:test";
import { communityService } from "@/services/community.service";
import { communityRepository } from "@/repositories/community.repository";
import { AppError } from "@/utils/errors";
import { testData } from "../../tests/helpers/testUtils";

const mockCommunityRepository = {
  create: mock(() => Promise.resolve(testData.community)),
  findById: mock(() => Promise.resolve(testData.community)),
  update: mock(() => Promise.resolve(testData.community)),
  delete: mock(() => Promise.resolve(testData.community)),
};

describe("CommunityService", () => {
  beforeEach(() => {
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    (communityRepository.create as any) = mockCommunityRepository.create;
    (communityRepository.findById as any) = mockCommunityRepository.findById;
  });

  describe("createCommunity", () => {
    it("should create a community and assign creator as admin", async () => {
      const result = await communityService.createCommunity(
        { name: "Test Community", description: "Test" },
        "user-123"
      );

      expect(result).toEqual(testData.community);
      expect(mockCommunityRepository.create).toHaveBeenCalledWith({
        name: "Test Community",
        description: "Test",
        createdBy: "user-123"
      });
    });

    it("should throw AppError if user not found", async () => {
      mockAppUserRepository.findById.mockResolvedValue(null);

      await expect(
        communityService.createCommunity({ name: "Test" }, "invalid-user")
      ).rejects.toThrow(AppError);
    });
  });
});
```

## OpenFGA Permission Guidelines

### ✅ DO: Check Permissions (Not Roles)

```typescript
// ✅ CORRECT: Check the permission
const canManage = await openFGAService.checkAccess(
  userId,
  'community',
  communityId,
  'can_manage_forum'
);

// ❌ WRONG: Don't check roles directly
const hasRole = await openFGAService.check({
  user: `user:${userId}`,
  relation: 'forum_manager',  // Don't check roles
  object: `community:${communityId}`
});
```

### Available Permissions by Feature

```typescript
// Trust Feature
'can_view_trust', 'can_award_trust'

// Wealth Feature
'can_view_wealth', 'can_create_wealth'

// Poll Feature
'can_view_poll', 'can_create_poll'

// Dispute Feature
'can_view_dispute', 'can_handle_dispute'

// Pool Feature
'can_view_pool', 'can_create_pool'

// Council Feature
'can_view_council', 'can_create_council'

// Forum Feature
'can_view_forum', 'can_manage_forum', 'can_create_thread',
'can_upload_attachment', 'can_flag_content', 'can_review_flag'

// Items Feature
'can_view_item', 'can_manage_item'

// Analytics Feature
'can_view_analytics'

// Generic CRUD (can be used with any resource)
'can_read', 'can_update', 'can_delete'
```

### How Permissions Work

Each permission is a **union** of multiple sources:
```
can_manage_forum = admin OR forum_manager OR trust_forum_manager
```

Where:
- `admin` = Base role (always has all permissions)
- `forum_manager` = Feature role assigned by admin
- `trust_forum_manager` = Trust role (auto-granted at threshold)

**You only check the permission** - OpenFGA evaluates all sources automatically.

### When to Use Each Method

```typescript
// Permission checks (most common)
checkAccess(userId, resourceType, resourceId, permission)

// Get user's base role (admin/member)
getUserBaseRole(userId, resourceType, resourceId)

// Assign base role (admin/member) - Only for membership
assignBaseRole(userId, resourceType, resourceId, 'admin' | 'member')

// Assign feature role - Only for admins granting specific permissions
assignFeatureRole(userId, communityId, featureRole)

// Low-level checks - Only when you need exact tuple control
check({ user, relation, object })
```

## Key Principles

1. **Check Permissions, Not Roles**: Always use `checkAccess()` with permissions (`can_*`)
2. **Single Responsibility**: Each service method handles one business operation
3. **Repository Orchestration**: Services coordinate multiple repositories
4. **Trust is Automatic**: Never manually check trust - it's included in permissions
5. **Rollback on Failure**: Critical operations must rollback on error
6. **Comprehensive Logging**: Log all operations for debugging and audit
7. **Error Handling**: Use AppError for all business logic errors
8. **Type Safety**: Use DTOs and types from `@/types/` directory
9. **Testability**: Design for easy mocking of dependencies

## Related Skills
- `api-repository` - Data access layer
- `api-controller` - HTTP request handling
- `api-testing` - Testing patterns
- `api-config` - OpenFGA and Keycloak configuration

## Feature Documentation
Before implementing service logic, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- Business rules and validation requirements
- Trust threshold configurations
- Permission models (role-based vs trust-based)
- Related database tables
