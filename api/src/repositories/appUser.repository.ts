import { eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@db/index';
import { appUsers } from '@db/schema';

export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;

export type UpdateAppUser = Partial<Omit<NewAppUser, 'id' | 'createdAt'>>;

export class AppUserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id)).limit(1);

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<AppUser | undefined> {
    const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email)).limit(1);

    return user;
  }

  /**
   * Find user by username (case-insensitive)
   */
  async findByUsername(username: string): Promise<AppUser | undefined> {
    const [user] = await db
      .select()
      .from(appUsers)
      .where(sql`LOWER(${appUsers.username}) = LOWER(${username})`)
      .limit(1);

    return user;
  }

  /**
   * Create a new user
   */
  async create(userData: NewAppUser): Promise<AppUser> {
    const [user] = await db
      .insert(appUsers)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return user;
  }

  /**
   * Find or create user by ID
   * This is useful for ensuring a user exists in the database
   */
  async findOrCreate(userData: NewAppUser): Promise<{ user: AppUser; created: boolean }> {
    const existing = await this.findById(userData.id);

    if (existing) {
      return { user: existing, created: false };
    }

    const user = await this.create(userData);
    return { user, created: true };
  }

  /**
   * Update user data
   */
  async update(id: string, updates: UpdateAppUser): Promise<AppUser | undefined> {
    const [user] = await db
      .update(appUsers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.id, id))
      .returning();

    return user;
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(id: string): Promise<void> {
    await db.update(appUsers).set({ lastSeenAt: new Date() }).where(eq(appUsers.id, id));
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await db.delete(appUsers).where(eq(appUsers.id, id));
  }

  /**
   * Search users by query (searches in username, displayName, email)
   * Supports pagination for large result sets
   */
  async search(query: string, limit = 10, offset = 0): Promise<AppUser[]> {
    const searchPattern = `%${query}%`;

    const users = await db
      .select()
      .from(appUsers)
      .where(
        or(
          ilike(appUsers.username, searchPattern),
          ilike(appUsers.displayName, searchPattern),
          ilike(appUsers.email, searchPattern)
        )
      )
      .limit(limit)
      .offset(offset);

    return users;
  }

  /**
   * Check if username is taken (case-insensitive)
   */
  async isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
    let query = db
      .select({ id: appUsers.id })
      .from(appUsers)
      .where(sql`LOWER(${appUsers.username}) = LOWER(${username})`);

    if (excludeUserId) {
      query = query.where(sql`${appUsers.id} != ${excludeUserId}`) as any;
    }

    const [result] = await query.limit(1);
    return !!result;
  }

  /**
   * Check if email is taken
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    let query = db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, email));

    if (excludeUserId) {
      query = query.where(sql`${appUsers.id} != ${excludeUserId}`) as any;
    }

    const [result] = await query.limit(1);
    return !!result;
  }

  /**
   * Get all users (with pagination)
   */
  async list(limit = 100, offset = 0): Promise<AppUser[]> {
    const users = await db
      .select()
      .from(appUsers)
      .limit(limit)
      .offset(offset)
      .orderBy(appUsers.createdAt);

    return users;
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(appUsers);

    return result?.count ?? 0;
  }

  /**
   * Backward compatibility alias
   * @deprecated Use findById instead
   */
  async findBySupertokensUserId(id: string): Promise<AppUser | undefined> {
    return this.findById(id);
  }
}

export const appUserRepository = new AppUserRepository();
