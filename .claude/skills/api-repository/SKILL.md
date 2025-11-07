---
name: api-repository
description: This skill teaches the agent how to implement the data access layer in the API project. MANDATORY - You MUST read this skill before modifying any repository files.
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
```typescript
// api/src/repositories/community.repository.ts
import { db } from '@/db';
import { communities } from '@/db/schema/communities.schema';
import { eq, and, isNull, ilike, or, desc } from 'drizzle-orm';
import type { CreateCommunityDto, UpdateCommunityDto } from '@/types/community.types';

class CommunityRepository {
  async create(data: CreateCommunityDto & { createdBy: string }) {
    const [community] = await db.insert(communities).values(data).returning();
    return community;
  }

  async findById(id: string) {
    const [community] = await db
      .select()
      .from(communities)
      .where(and(eq(communities.id, id), isNull(communities.deletedAt)));
    return community;
  }

  async update(id: string, data: UpdateCommunityDto) {
    const [updated] = await db
      .update(communities)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(communities.id, id), isNull(communities.deletedAt)))
      .returning();
    return updated;
  }

  async delete(id: string) {
    return await db.transaction(async (tx) => {
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
    return await db
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

export const communityRepository = new CommunityRepository();
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

Repositories are tested with actual database connections (integration tests):

```typescript
// api/src/repositories/community.repository.test.ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { communityRepository } from "./community.repository";
import { db } from "@/db";
import { communities } from "@/db/schema/communities.schema";

describe("CommunityRepository", () => {
  let testCommunityId: string;

  beforeEach(async () => {
    // Create test data
    const [community] = await db.insert(communities).values({
      name: "Test Community",
      description: "Test",
      createdBy: "test-user-123"
    }).returning();
    testCommunityId = community.id;
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(communities).where(eq(communities.id, testCommunityId));
  });

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
});
```

## Key Principles

1. **Single Responsibility**: Each repository handles one table or entity
2. **No Business Logic**: Only data access, no validation or business rules
3. **Soft Deletes**: Always use `deletedAt` for deletions, never hard delete
4. **Transactions**: Use for multi-step operations that must succeed together
5. **Type Safety**: Use schema types from Drizzle
6. **SQL Safety**: Use parameterized queries, never string concatenation
7. **Consistent Patterns**: Use same patterns across all repositories
8. **Return Types**: Always return raw database types, not DTOs

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
