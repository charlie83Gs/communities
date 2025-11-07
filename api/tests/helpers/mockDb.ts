import { mock } from "bun:test";

/**
 * Creates a thenable mock database object for testing Drizzle ORM queries
 *
 * This mock supports:
 * - Method chaining (insert().values().returning())
 * - Awaitable queries (await db.select().from()...)
 * - Mutable query builders (const q = db.select(); q.orderBy(); await q;)
 *
 * Usage:
 * ```typescript
 * const mockDb = createThenableMockDb();
 *
 * // For queries that continue chaining:
 * mockDb.where.mockReturnValueOnce(mockDb);
 *
 * // For queries that resolve:
 * mockDb.where.mockResolvedValueOnce([{ id: "123" }]);
 *
 * // For mutable queries that are awaited later:
 * mockDb.then.mockImplementationOnce((resolve) => {
 *   resolve([{ id: "123" }]);
 *   return Promise.resolve([{ id: "123" }]);
 * });
 * ```
 */
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
    rightJoin: mock(() => mockDb),
    groupBy: mock(() => mockDb),
    having: mock(() => mockDb),
    // Make it thenable so it can be awaited
    then: mock((resolve: Function) => {
      resolve([]);
      return Promise.resolve([]);
    }),
  };
  return mockDb;
}

/**
 * Sets up default mock chains for a mockDb object
 * Call this in beforeEach to reset mocks between tests
 */
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
  mockDb.leftJoin.mockReturnValue(mockDb);
  mockDb.innerJoin.mockReturnValue(mockDb);
  mockDb.rightJoin.mockReturnValue(mockDb);
  mockDb.groupBy.mockReturnValue(mockDb);
  mockDb.having.mockReturnValue(mockDb);
  mockDb.delete.mockReturnValue(mockDb);
  mockDb.then.mockImplementation((resolve: Function) => {
    resolve([]);
    return Promise.resolve([]);
  });
}
