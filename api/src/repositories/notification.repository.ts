import { db as realDb } from '@db/index';
import { notifications } from '@db/schema/notifications.schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import type { NotificationCreate, NotificationListOptions } from '@/types/notification.types';

export type NotificationRecord = typeof notifications.$inferSelect;

export class NotificationRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async create(data: NotificationCreate): Promise<NotificationRecord> {
    const [row] = await this.db
      .insert(notifications)
      .values({
        userId: data.userId,
        communityId: data.communityId,
        type: data.type,
        title: data.title,
        message: data.message,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        actorId: data.actorId,
      })
      .returning();
    return row;
  }

  async findById(id: string): Promise<NotificationRecord | undefined> {
    const [row] = await this.db.select().from(notifications).where(eq(notifications.id, id));
    return row;
  }

  async listByUserId(
    userId: string,
    options?: NotificationListOptions
  ): Promise<NotificationRecord[]> {
    const whereParts: any[] = [eq(notifications.userId, userId)];

    if (options?.communityId) {
      whereParts.push(eq(notifications.communityId, options.communityId));
    }

    if (options?.unreadOnly) {
      whereParts.push(eq(notifications.isRead, false));
    }

    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    return await this.db
      .select()
      .from(notifications)
      .where(and(...whereParts))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUnreadCount(userId: string, communityId?: string): Promise<number> {
    const whereParts: any[] = [eq(notifications.userId, userId), eq(notifications.isRead, false)];

    if (communityId) {
      whereParts.push(eq(notifications.communityId, communityId));
    }

    const [result] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notifications)
      .where(and(...whereParts));

    return result?.count ?? 0;
  }

  async getTotalCount(userId: string, communityId?: string, unreadOnly?: boolean): Promise<number> {
    const whereParts: any[] = [eq(notifications.userId, userId)];

    if (communityId) {
      whereParts.push(eq(notifications.communityId, communityId));
    }

    if (unreadOnly) {
      whereParts.push(eq(notifications.isRead, false));
    }

    const [result] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notifications)
      .where(and(...whereParts));

    return result?.count ?? 0;
  }

  async markAsRead(id: string): Promise<NotificationRecord | undefined> {
    const [row] = await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return row;
  }

  async markAllAsRead(userId: string, communityId?: string): Promise<number> {
    const whereParts: any[] = [eq(notifications.userId, userId), eq(notifications.isRead, false)];

    if (communityId) {
      whereParts.push(eq(notifications.communityId, communityId));
    }

    const result = await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(...whereParts))
      .returning();

    return result.length;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(notifications).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }

  async getByResource(
    resourceType: string,
    resourceId: string,
    userId: string
  ): Promise<NotificationRecord[]> {
    return await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.resourceType, resourceType),
          eq(notifications.resourceId, resourceId),
          eq(notifications.userId, userId)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async markResourceNotificationsAsRead(
    resourceType: string,
    resourceId: string,
    userId: string
  ): Promise<number> {
    const result = await this.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.resourceType, resourceType),
          eq(notifications.resourceId, resourceId),
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .returning();

    return result.length;
  }
}

// Default instance for production code paths
export const notificationRepository = new NotificationRepository(realDb);
