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

### 2. Authorization Checks
```typescript
async updateCommunity(id: string, data: UpdateCommunityDto, userId: string): Promise<Community> {
  // 1. Verify resource exists
  const community = await communityRepository.findById(id);
  if (!community) {
    throw new AppError("Community not found", 404);
  }

  // 2. Check permissions via OpenFGA
  const canUpdate = await openfgaService.check({
    user: `user:${userId}`,
    relation: 'can_update',
    object: `community:${id}`
  });

  if (!canUpdate) {
    throw new AppError("You do not have permission to update this community", 403);
  }

  // 3. Perform update
  return await communityRepository.update(id, data);
}
```

### 3. Transaction Management with Multiple Repositories
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

  // 2. Check authorization
  const canShare = await openfgaService.check({
    user: `user:${userId}`,
    relation: 'can_share_wealth',
    object: `community:${wealth.communityId}`
  });
  if (!canShare) {
    throw new AppError("Insufficient trust to share wealth", 403);
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

### 4. Batch Operations
```typescript
async getUserCommunitiesWithTrust(userId: string): Promise<CommunityWithTrust[]> {
  // 1. Get user memberships
  const memberships = await communityMemberRepository.findByUser(userId);
  const communityIds = memberships.map(m => m.resourceId);

  if (communityIds.length === 0) return [];

  // 2. Batch fetch communities
  const communities = await communityRepository.findByIds(communityIds);

  // 3. Batch fetch trust scores
  const trustScores = await trustViewRepository.getBatchForUser(userId, communityIds);

  // 4. Combine data
  return communities.map(community => ({
    ...community,
    trustScore: trustScores.get(community.id) ?? 0,
    role: memberships.find(m => m.resourceId === community.id)?.role
  }));
}
```

### 5. Error Handling Best Practices
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

## Key Principles

1. **Single Responsibility**: Each service method handles one business operation
2. **Repository Orchestration**: Services coordinate multiple repositories
3. **Authorization**: Always check OpenFGA permissions before operations
4. **Rollback on Failure**: Critical operations must rollback on error
5. **Comprehensive Logging**: Log all operations for debugging and audit
6. **Error Handling**: Use AppError for all business logic errors
7. **Type Safety**: Use DTOs and types from `@/types/` directory
8. **Testability**: Design for easy mocking of dependencies

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
