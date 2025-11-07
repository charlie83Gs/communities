---
name: api-testing
description: This skill teaches the agent how to write and manage tests in the API project. MANDATORY - You MUST read this skill before modifying any test files.
---

# API Testing Skill

## Purpose
This skill covers the testing layer of the API project, including unit tests, integration tests, mocking patterns, and test data management.

## When to Use This Skill
- Writing unit tests for services
- Testing repositories with database
- Mocking dependencies
- Setting up test data
- Testing error scenarios

## Testing Framework: Bun Test

Bun provides a built-in test runner similar to Jest:

```typescript
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
```

## Key Testing Patterns

### 1. Service Unit Tests with Mocks
```typescript
// api/src/services/community.service.test.ts
import { describe, it, expect, beforeEach, mock } from "bun:test";
import { communityService } from "@/services/community.service";
import { communityRepository } from "@/repositories/community.repository";
import { communityMemberRepository } from "@/repositories/communityMember.repository";
import { appUserRepository } from "@repositories/appUser.repository";
import { trustViewRepository } from "@/repositories/trustView.repository";
import { AppError } from "@/utils/errors";
import { testData } from "../../tests/helpers/testUtils";

// Mock repositories
const mockCommunityRepository = {
  create: mock(() => Promise.resolve(testData.community)),
  findById: mock(() => Promise.resolve(testData.community)),
  update: mock(() => Promise.resolve(testData.community)),
  delete: mock(() => Promise.resolve(testData.community)),
  search: mock(() => Promise.resolve({ rows: [testData.community], total: 1 })),
};

const mockCommunityMemberRepository = {
  addMember: mock(() => Promise.resolve()),
  getUserRole: mock(() => Promise.resolve("admin")),
  isAdmin: mock(() => Promise.resolve(true)),
  findByUser: mock(() =>
    Promise.resolve([{ resourceId: "comm-123", role: "admin" }]),
  ),
  removeMember: mock(() => Promise.resolve()),
  updateRole: mock(() => Promise.resolve()),
};

const mockAppUserRepository = {
  findById: mock(() =>
    Promise.resolve({
      id: "user-123",
      email: "test@example.com",
      username: "testuser",
      displayName: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ),
};

const mockTrustViewRepository = {
  getBatchForUser: mock(() => Promise.resolve(new Map([["comm-123", 25]]))),
};

describe("CommunityService", () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustViewRepository).forEach((m) => m.mockReset());

    // Replace repository methods with mocks
    (communityRepository.create as any) = mockCommunityRepository.create;
    (communityRepository.findById as any) = mockCommunityRepository.findById;
    (communityRepository.update as any) = mockCommunityRepository.update;
    (communityRepository.delete as any) = mockCommunityRepository.delete;
    (communityRepository.search as any) = mockCommunityRepository.search;

    (communityMemberRepository.addMember as any) =
      mockCommunityMemberRepository.addMember;
    (communityMemberRepository.getUserRole as any) =
      mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.isAdmin as any) =
      mockCommunityMemberRepository.isAdmin;
    (communityMemberRepository.findByUser as any) =
      mockCommunityMemberRepository.findByUser;
    (communityMemberRepository.removeMember as any) =
      mockCommunityMemberRepository.removeMember;
    (communityMemberRepository.updateRole as any) =
      mockCommunityMemberRepository.updateRole;

    (appUserRepository.findById as any) = mockAppUserRepository.findById;

    (trustViewRepository.getBatchForUser as any) =
      mockTrustViewRepository.getBatchForUser;
  });

  describe("createCommunity", () => {
    it("should create a community and assign creator as admin", async () => {
      mockAppUserRepository.findById.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await communityService.createCommunity(
        { name: "Test Community", description: "Test" },
        "user-123"
      );

      expect(result).toEqual(testData.community);
      expect(mockCommunityRepository.create).toHaveBeenCalledWith({
        name: "Test Community",
        description: "Test",
        createdBy: "user-123",
      });
      expect(mockCommunityMemberRepository.addMember).toHaveBeenCalled();
    });

    it("should throw AppError if user not found", async () => {
      mockAppUserRepository.findById.mockResolvedValue(null);

      await expect(
        communityService.createCommunity(
          { name: "Test Community" },
          "invalid-user"
        )
      ).rejects.toThrow(AppError);
    });

    it("should rollback community creation if admin assignment fails", async () => {
      mockCommunityMemberRepository.addMember.mockRejectedValue(
        new Error("Failed to assign admin")
      );

      await expect(
        communityService.createCommunity({ name: "Test" }, "user-123")
      ).rejects.toThrow();

      expect(mockCommunityRepository.delete).toHaveBeenCalled();
    });
  });

  describe("updateCommunity", () => {
    it("should update community if user is admin", async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);

      const result = await communityService.updateCommunity(
        "comm-123",
        { name: "Updated Name" },
        "user-123"
      );

      expect(result).toEqual(testData.community);
      expect(mockCommunityRepository.update).toHaveBeenCalledWith(
        "comm-123",
        { name: "Updated Name" }
      );
    });

    it("should throw AppError if user is not admin", async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        communityService.updateCommunity(
          "comm-123",
          { name: "Updated" },
          "user-456"
        )
      ).rejects.toThrow(AppError);
    });

    it("should throw AppError if community not found", async () => {
      mockCommunityRepository.findById.mockResolvedValue(null);

      await expect(
        communityService.updateCommunity(
          "invalid-id",
          { name: "Updated" },
          "user-123"
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe("deleteCommunity", () => {
    it("should delete community if user is admin", async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);

      await communityService.deleteCommunity("comm-123", "user-123");

      expect(mockCommunityRepository.delete).toHaveBeenCalledWith("comm-123");
    });

    it("should throw AppError if user is not admin", async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        communityService.deleteCommunity("comm-123", "user-456")
      ).rejects.toThrow(AppError);
    });
  });
});
```

### 2. Test Data Helpers
```typescript
// tests/helpers/testUtils.ts
export const testData = {
  community: {
    id: "comm-123",
    name: "Test Community",
    description: "Test Description",
    createdBy: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  user: {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    displayName: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  trustAward: {
    id: "trust-123",
    communityId: "comm-123",
    fromUserId: "user-123",
    toUserId: "user-456",
    createdAt: new Date(),
    deletedAt: null,
  },
};

export function createMockCommunity(overrides = {}) {
  return {
    ...testData.community,
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    ...testData.user,
    ...overrides,
  };
}
```

### 3. Repository Integration Tests
```typescript
// api/src/repositories/community.repository.test.ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { communityRepository } from "./community.repository";
import { db } from "@/db";
import { communities } from "@/db/schema/communities.schema";
import { eq } from "drizzle-orm";

describe("CommunityRepository", () => {
  let testCommunityId: string;

  beforeEach(async () => {
    // Create test data
    const [community] = await db
      .insert(communities)
      .values({
        name: "Test Community",
        description: "Test",
        createdBy: "test-user-123",
      })
      .returning();
    testCommunityId = community.id;
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(communities).where(eq(communities.id, testCommunityId));
  });

  describe("findById", () => {
    it("should find community by id", async () => {
      const community = await communityRepository.findById(testCommunityId);
      expect(community).toBeDefined();
      expect(community.name).toBe("Test Community");
    });

    it("should not find soft-deleted community", async () => {
      await communityRepository.delete(testCommunityId);
      const community = await communityRepository.findById(testCommunityId);
      expect(community).toBeUndefined();
    });

    it("should return undefined for non-existent id", async () => {
      const community = await communityRepository.findById(
        "00000000-0000-0000-0000-000000000000"
      );
      expect(community).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should update community name", async () => {
      const updated = await communityRepository.update(testCommunityId, {
        name: "Updated Name",
      });
      expect(updated.name).toBe("Updated Name");
    });

    it("should update updatedAt timestamp", async () => {
      const before = await communityRepository.findById(testCommunityId);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait 10ms
      const updated = await communityRepository.update(testCommunityId, {
        description: "New description",
      });
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        before!.updatedAt.getTime()
      );
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      // Create additional test communities
      await db.insert(communities).values([
        { name: "Alpha Community", createdBy: "user-1" },
        { name: "Beta Community", createdBy: "user-2" },
        { name: "Gamma Community", createdBy: "user-3" },
      ]);
    });

    it("should find communities by name", async () => {
      const result = await communityRepository.search("Alpha", 0, 10);
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].name).toContain("Alpha");
    });

    it("should return paginated results", async () => {
      const result = await communityRepository.search("Community", 0, 2);
      expect(result.rows.length).toBe(2);
      expect(result.total).toBeGreaterThan(2);
    });
  });
});
```

### 4. Testing Error Scenarios
```typescript
describe("Error Handling", () => {
  it("should throw AppError with 404 when resource not found", async () => {
    mockCommunityRepository.findById.mockResolvedValue(null);

    try {
      await communityService.getCommunityById("invalid-id", "user-123");
      fail("Should have thrown AppError");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
      expect((err as AppError).message).toContain("not found");
    }
  });

  it("should throw AppError with 403 for unauthorized access", async () => {
    mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

    try {
      await communityService.deleteCommunity("comm-123", "user-456");
      fail("Should have thrown AppError");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(403);
    }
  });

  it("should handle database errors gracefully", async () => {
    mockCommunityRepository.create.mockRejectedValue(
      new Error("Database error")
    );

    await expect(
      communityService.createCommunity({ name: "Test" }, "user-123")
    ).rejects.toThrow();
  });
});
```

### 5. Async Testing Patterns
```typescript
describe("Async Operations", () => {
  it("should handle concurrent operations", async () => {
    const promises = [
      communityService.createCommunity({ name: "Community 1" }, "user-1"),
      communityService.createCommunity({ name: "Community 2" }, "user-2"),
      communityService.createCommunity({ name: "Community 3" }, "user-3"),
    ];

    const results = await Promise.all(promises);
    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  it("should timeout long-running operations", async () => {
    const slowOperation = async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return "done";
    };

    await expect(
      Promise.race([
        slowOperation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 1000)
        ),
      ])
    ).rejects.toThrow("Timeout");
  });
});
```

### 6. Mock Functions
```typescript
// Creating mocks
const mockFn = mock(() => "default value");
const mockAsync = mock(() => Promise.resolve("async value"));

// Mocking return values
mockFn.mockReturnValue("new value");
mockAsync.mockResolvedValue("new async value");
mockAsync.mockRejectedValue(new Error("error"));

// Mocking implementations
mockFn.mockImplementation((arg) => `received ${arg}`);

// Checking calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");

// Resetting mocks
mockFn.mockReset();        // Clear call history and implementation
mockFn.mockClear();        // Clear call history only
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific file
bun test api/src/services/community.service.test.ts

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch

# Run tests matching pattern
bun test --name "createCommunity"
```

## Test Organization

```
api/
├── src/
│   ├── services/
│   │   ├── community.service.ts
│   │   └── community.service.test.ts        # Co-located with service
│   ├── repositories/
│   │   ├── community.repository.ts
│   │   └── community.repository.test.ts     # Co-located with repository
└── tests/
    ├── helpers/
    │   ├── testUtils.ts                     # Shared test utilities
    │   └── mockData.ts                      # Test data
    └── integration/
        └── api.test.ts                      # Integration tests
```

## Best Practices

1. **Co-locate Tests**: Place test files next to the code they test
2. **Mock External Dependencies**: Mock repositories in service tests
3. **Use Test Data Helpers**: Create reusable test data generators
4. **Test Error Paths**: Always test error scenarios
5. **Clean Up**: Use afterEach to clean up database test data
6. **Descriptive Names**: Use clear test descriptions
7. **Arrange-Act-Assert**: Follow AAA pattern
8. **Avoid Test Interdependence**: Each test should be independent
9. **Mock Reset**: Reset mocks in beforeEach
10. **Integration vs Unit**: Use unit tests for services, integration for repositories

## Assertions

```typescript
// Equality
expect(value).toBe(expected);              // Strict equality (===)
expect(value).toEqual(expected);           // Deep equality
expect(value).not.toBe(expected);          // Negation

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(number).toBeGreaterThan(5);
expect(number).toBeGreaterThanOrEqual(5);
expect(number).toBeLessThan(10);
expect(number).toBeLessThanOrEqual(10);

// Strings
expect(string).toContain("substring");
expect(string).toMatch(/regex/);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty("key");
expect(object).toHaveProperty("key", "value");

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);
expect(() => fn()).toThrow("error message");
await expect(asyncFn()).rejects.toThrow();

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

## Related Skills
- `api-service` - Service layer being tested
- `api-repository` - Repository layer being tested
- `api-controller` - Controller integration tests

## Feature Documentation
Before writing tests, **MUST READ** the relevant feature documentation in `docs/features/` and the co-located test files to understand:
- Expected behavior
- Error scenarios
- Business rules
- Edge cases
