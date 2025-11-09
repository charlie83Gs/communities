---
name: api-repository
description: This skill teaches the agent how to implement the data access layer in the API project. MANDATORY - You MUST read this skill before modifying any ./api repository files.
---

# API Repository Layer Skill

## Purpose
This skill covers the repository layer of the API project - the data access layer that handles all direct database interactions and manages transactions.

## When to Use This Skill
- Implementing CRUD operations
- Writing complex SQL queries with Drizzle
- Managing database transactions
- Implementing soft deletes
- Batch operations and joins

## Key Patterns from Codebase

### 1. Basic Repository Structure

**CRITICAL: Constructor-Based Pattern for Testability**

All repositories MUST use constructor injection to accept the database instance. This enables proper testing with mock databases.

```typescript
// api/src/repositories/community.repository.ts
import { db as realDb } from '@/db';
import { communities } from '@/db/schema/communities.schema';
import { eq, and, isNull, ilike, or, desc, inArray } from 'drizzle-orm';
import type { CreateCommunityDto, UpdateCommunityDto } from '@/types/community.types';

class CommunityRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async create(data: CreateCommunityDto & { createdBy: string }) {
    const [community] = await this.db.insert(communities).values(data).returning();
    return community;
  }

  async findById(id: string) {
    const [community] = await this.db
      .select()
      .from(communities)
      .where(and(eq(communities.id, id), isNull(communities.deletedAt)));
    return community;
  }

  async update(id: string, data: UpdateCommunityDto) {
    const [updated] = await this.db
      .update(communities)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(communities.id, id), isNull(communities.deletedAt)))
      .returning();
    return updated;
  }

  async delete(id: string) {
    return await this.db.transaction(async (tx) => {
      // Soft delete community
      const [deleted] = await tx
        .update(communities)
        .set({ deletedAt: new Date() })
        .where(eq(communities.id, id))
        .returning();

      // Cascade soft delete to related tables
      await tx
        .update(communityMembers)
        .set({ deletedAt: new Date() })
        .where(eq(communityMembers.resourceId, id));

      return deleted;
    });
  }

  async findByIds(ids: string[]) {
    return await this.db
      .select()
      .from(communities)
      .where(
        and(
          inArray(communities.id, ids),
          isNull(communities.deletedAt)
        )
      );
  }
}

// Default instance for production code paths
export const communityRepository = new CommunityRepository(realDb);
```

### 2. Search with Pagination
```typescript
async search(query: string, page: number, limit: number) {
  const offset = page * limit;

  const rows = await db
    .select()
    .from(communities)
    .where(
      and(
        or(
          ilike(communities.name, `%${query}%`),
          ilike(communities.description, `%${query}%`)
        ),
        isNull(communities.deletedAt)
      )
    )
    .orderBy(desc(communities.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communities)
    .where(
      and(
        or(
          ilike(communities.name, `%${query}%`),
          ilike(communities.description, `%${query}%`)
        ),
        isNull(communities.deletedAt)
      )
    );

  return { rows, total: count };
}
```

### 3. Complex Joins
```typescript
async getCommunityWithMembers(communityId: string) {
  return await db
    .select({
      community: communities,
      member: appUsers,
      membership: resourceMemberships,
    })
    .from(communities)
    .leftJoin(
      resourceMemberships,
      and(
        eq(resourceMemberships.resourceId, communities.id),
        eq(resourceMemberships.resourceType, 'community'),
        isNull(resourceMemberships.deletedAt)
      )
    )
    .leftJoin(
      appUsers,
      eq(appUsers.id, resourceMemberships.userId)
    )
    .where(
      and(
        eq(communities.id, communityId),
        isNull(communities.deletedAt)
      )
    );
}
```

### 4. Batch Operations
```typescript
async createBatch(items: CreateItemDto[]) {
  return await db.insert(items).values(items).returning();
}

async updateBatch(updates: Array<{ id: string; data: UpdateItemDto }>) {
  return await db.transaction(async (tx) => {
    const results = [];
    for (const { id, data } of updates) {
      const [updated] = await tx
        .update(items)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(items.id, id))
        .returning();
      results.push(updated);
    }
    return results;
  });
}
```

### 5. Transactions with Rollback
```typescript
async transferWealthToCouncil(wealthId: string, councilId: string, quantity: number) {
  return await db.transaction(async (tx) => {
    // 1. Deduct from wealth
    const [wealth] = await tx
      .update(items)
      .set({
        quantity: sql`${items.quantity} - ${quantity}`,
        updatedAt: new Date()
      })
      .where(eq(items.id, wealthId))
      .returning();

    if (wealth.quantity < 0) {
      // This will rollback the entire transaction
      throw new Error("Insufficient quantity");
    }

    // 2. Add to council inventory
    await tx.insert(councilInventory).values({
      councilId,
      itemId: wealthId,
      quantity,
      receivedAt: new Date()
    });

    // 3. Record transaction
    await tx.insert(councilTransactions).values({
      councilId,
      itemId: wealthId,
      quantity,
      type: 'received',
      timestamp: new Date()
    });

    return wealth;
  });
}
```

### 6. Soft Delete Handling
```typescript
// Always exclude soft-deleted records
async findAll() {
  return await db
    .select()
    .from(communities)
    .where(isNull(communities.deletedAt));
}

// Include deleted records for admin purposes
async findAllIncludingDeleted() {
  return await db.select().from(communities);
}

// Restore soft-deleted record
async restore(id: string) {
  const [restored] = await db
    .update(communities)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(communities.id, id))
    .returning();
  return restored;
}
```

### 7. Aggregations
```typescript
async getCommunityStats(communityId: string) {
  const [stats] = await db
    .select({
      totalMembers: sql<number>`count(distinct ${resourceMemberships.userId})::int`,
      totalWealth: sql<number>`count(distinct ${items.id})::int`,
      avgTrustScore: sql<number>`avg(${trustView.score})::int`,
    })
    .from(communities)
    .leftJoin(
      resourceMemberships,
      and(
        eq(resourceMemberships.resourceId, communities.id),
        isNull(resourceMemberships.deletedAt)
      )
    )
    .leftJoin(
      items,
      and(
        eq(items.communityId, communities.id),
        isNull(items.deletedAt)
      )
    )
    .leftJoin(
      trustView,
      eq(trustView.communityId, communities.id)
    )
    .where(eq(communities.id, communityId))
    .groupBy(communities.id);

  return stats;
}
```

## Testing Repositories

**CRITICAL: Use Constructor-Based Mocking Pattern**

Repositories are tested using constructor injection with mock databases. This provides clean test isolation without polluting global state.

```typescript
// api/src/repositories/community.repository.test.ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CommunityRepository } from "./community.repository";
import { createThenableMockDb, setupMockDbChains } from "../../tests/helpers/mockDb";

// Create mock database
const mockDb = createThenableMockDb();

let communityRepository: CommunityRepository;

const testCommunity = {
  id: 'comm-123',
  name: 'Test Community',
  description: 'Test Description',
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

describe("CommunityRepository", () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    communityRepository = new CommunityRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh CommunityRepository is created per test
  });

  it("should create a community", async () => {
    mockDb.returning.mockResolvedValue([testCommunity]);

    const result = await communityRepository.create({
      name: 'Test Community',
      description: 'Test Description',
      createdBy: 'user-123',
    });

    expect(result).toEqual(testCommunity);
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalled();
    expect(mockDb.returning).toHaveBeenCalled();
  });

  it("should find community by id", async () => {
    mockDb.where.mockResolvedValue([testCommunity]);

    const result = await communityRepository.findById('comm-123');

    expect(result).toEqual(testCommunity);
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
  });

  it("should return undefined if not found", async () => {
    mockDb.where.mockResolvedValue([]);

    const result = await communityRepository.findById('nonexistent');

    expect(result).toBeUndefined();
  });

  it("should update community", async () => {
    const updatedCommunity = { ...testCommunity, name: 'Updated Name' };
    mockDb.returning.mockResolvedValue([updatedCommunity]);

    const result = await communityRepository.update('comm-123', {
      name: 'Updated Name',
    });

    expect(result?.name).toBe('Updated Name');
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.set).toHaveBeenCalled();
  });
});
```

### Mock Database Helper

The `createThenableMockDb()` helper creates a chainable mock database for testing:

```typescript
// tests/helpers/mockDb.ts
import { mock } from "bun:test";

export function createThenableMockDb() {
  const mockDb: any = {
    insert: mock(() => mockDb),
    values: mock(() => mockDb),
    returning: mock(() => Promise.resolve([])),
    select: mock(() => mockDb),
    from: mock(() => mockDb),
    where: mock(() => mockDb),
    orderBy: mock(() => mockDb),
    limit: mock(() => mockDb),
    offset: mock(() => mockDb),
    update: mock(() => mockDb),
    set: mock(() => mockDb),
    delete: mock(() => mockDb),
    leftJoin: mock(() => mockDb),
    innerJoin: mock(() => mockDb),
    groupBy: mock(() => mockDb),
    transaction: mock((fn: Function) => fn(mockDb)),
    execute: mock(() => Promise.resolve([])),
    // Make it thenable so it can be awaited
    then: mock((resolve: Function) => {
      resolve([]);
      return Promise.resolve([]);
    }),
  };
  return mockDb;
}

export function setupMockDbChains(mockDb: any) {
  // Reset all mocks
  Object.values(mockDb).forEach((m) => {
    if (typeof m === "function" && "mockReset" in m) {
      (m as any).mockReset();
    }
  });

  // Set up default mock chains
  mockDb.insert.mockReturnValue(mockDb);
  mockDb.values.mockReturnValue(mockDb);
  mockDb.select.mockReturnValue(mockDb);
  mockDb.from.mockReturnValue(mockDb);
  mockDb.where.mockReturnValue(mockDb);
  mockDb.orderBy.mockReturnValue(mockDb);
  mockDb.limit.mockReturnValue(mockDb);
  mockDb.offset.mockReturnValue(mockDb);
  mockDb.update.mockReturnValue(mockDb);
  mockDb.set.mockReturnValue(mockDb);
  mockDb.delete.mockReturnValue(mockDb);
  mockDb.leftJoin.mockReturnValue(mockDb);
  mockDb.innerJoin.mockReturnValue(mockDb);
  mockDb.groupBy.mockReturnValue(mockDb);
  mockDb.transaction.mockImplementation((fn: Function) => fn(mockDb));
  mockDb.then.mockImplementation((resolve: Function) => {
    resolve([]);
    return Promise.resolve([]);
  });
}
```

## Key Principles

1. **Constructor Injection**: ALWAYS use constructor to accept database instance
   - Import `db as realDb` from '@/db'
   - Add `private db: any;` property
   - Add `constructor(db: any) { this.db = db; }`
   - Use `this.db` instead of `db` in all methods
   - Export default instance: `export const repository = new Repository(realDb);`

2. **Single Responsibility**: Each repository handles one table or entity

3. **No Business Logic**: Only data access, no validation or business rules

4. **Soft Deletes**: Always use `deletedAt` for deletions, never hard delete

5. **Transactions**: Use for multi-step operations that must succeed together

6. **Type Safety**: Use schema types from Drizzle

7. **SQL Safety**: Use parameterized queries, never string concatenation

8. **Consistent Patterns**: Use same patterns across all repositories

9. **Return Types**: Always return raw database types, not DTOs

10. **Testability**: Constructor injection enables clean unit testing with mock databases

## Drizzle ORM Operators

```typescript
import { eq, and, or, isNull, isNotNull, gt, gte, lt, lte, inArray, like, ilike, desc, asc, sql } from 'drizzle-orm';

// Equality
eq(communities.id, id)

// Logical operators
and(eq(communities.id, id), isNull(communities.deletedAt))
or(ilike(communities.name, `%${query}%`), ilike(communities.description, `%${query}%`))

// Null checks
isNull(communities.deletedAt)
isNotNull(communities.createdBy)

// Comparisons
gt(trustView.score, 20)
gte(trustView.score, 15)
lt(items.quantity, 10)
lte(items.quantity, 5)

// Array operations
inArray(communities.id, [id1, id2, id3])

// String matching
like(communities.name, 'Community%')  // Case-sensitive
ilike(communities.name, '%community%')  // Case-insensitive

// Ordering
orderBy(desc(communities.createdAt))
orderBy(asc(communities.name))

// Raw SQL (use sparingly)
sql`count(*)::int`
sql`${items.quantity} - ${quantity}`
```

## Special Case: OpenFGA Repository

The OpenFGA repository is unique as it wraps the OpenFGA SDK client instead of a database. It follows different patterns:

### Key Pattern: Direct SDK Parameter Passing

**CRITICAL**: The OpenFGA SDK expects parameters directly, NOT wrapped in API-specific keys.

```typescript
// api/src/repositories/openfga.repository.ts
async readTuples(pattern: {
  user?: string;
  relation?: string;
  object?: string;
}): Promise<Array<{ key: { user?: string; relation: string; object: string } }>> {
  await this.ensureInitialized();

  try {
    // ✅ CORRECT: Pass pattern directly to SDK
    // SDK expects { user?, relation?, object? }
    // NOT wrapped in tuple_key (that's the REST API format)
    const response = await this.client.read(pattern);

    return response.tuples || [];
  } catch (error) {
    console.error('[OpenFGA Repository] Read tuples error:', error);
    return [];
  }
}
```

**Common Mistake to Avoid:**
```typescript
// ❌ WRONG: Wrapping in tuple_key
const response = await this.client.read({
  tuple_key: pattern  // This causes the SDK to ignore the filter!
} as any);
```

### Why This Matters

If the SDK receives incorrectly formatted parameters:
- The filter is ignored
- **ALL tuples in the entire store are returned**
- This can cause catastrophic bugs where operations affect wrong users
- Example: Assigning a role to User A could accidentally delete User B's roles

### Write Operations

Similarly, write operations expect tuples directly:

```typescript
async write(
  writes?: Array<{ user: string; relation: string; object: string }>,
  deletes?: Array<{ user: string; relation: string; object: string }>
): Promise<void> {
  await this.ensureInitialized();

  try {
    // ✅ CORRECT: Pass arrays directly
    await this.client.write({ writes, deletes });
  } catch (error) {
    console.error('[OpenFGA Repository] Write error:', error);
    throw error;
  }
}
```

### Testing OpenFGA Repository

OpenFGA repository tests use a mock SDK client instead of a mock database:

```typescript
import { mock } from 'bun:test';

const mockRepository = {
  check: mock(() => Promise.resolve(false)),
  read: mock(() => Promise.resolve({ tuples: [] })),
  readTuples: mock(() => Promise.resolve([])),
  write: mock(() => Promise.resolve()),
  listObjects: mock(() => Promise.resolve([])),
};
```

## Related Skills
- `api-service` - Business logic layer
- `api-db` - Database migrations and schema
- `api-testing` - Integration testing

## Feature Documentation
Before implementing repository methods, **MUST READ** the relevant feature documentation in `docs/features/` to understand:
- Database table structure
- Related tables and foreign keys
- Soft delete requirements
- Query patterns needed
