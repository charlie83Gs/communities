import { db as realDb } from '@db/index';
import { wealthRequestMessages } from '@db/schema/wealth.schema';
import { appUsers } from '@db/schema/app_users.schema';
import { eq, sql, desc } from 'drizzle-orm';

export type WealthRequestMessageRecord = typeof wealthRequestMessages.$inferSelect;

export type WealthRequestMessageWithAuthor = WealthRequestMessageRecord & {
  author: {
    id: string;
    displayName: string;
  };
};

export type CreateMessageInput = {
  requestId: string;
  authorId: string;
  content: string;
};

export class WealthRequestMessageRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async create(data: CreateMessageInput): Promise<WealthRequestMessageRecord> {
    const [row] = await this.db
      .insert(wealthRequestMessages)
      .values({
        requestId: data.requestId,
        authorId: data.authorId,
        content: data.content,
      })
      .returning();
    return row;
  }

  async listByRequestId(requestId: string): Promise<WealthRequestMessageWithAuthor[]> {
    const rows = await this.db
      .select({
        id: wealthRequestMessages.id,
        requestId: wealthRequestMessages.requestId,
        authorId: wealthRequestMessages.authorId,
        content: wealthRequestMessages.content,
        createdAt: wealthRequestMessages.createdAt,
        authorDisplayName: appUsers.displayName,
        authorUsername: appUsers.username,
      })
      .from(wealthRequestMessages)
      .leftJoin(appUsers, eq(wealthRequestMessages.authorId, appUsers.id))
      .where(eq(wealthRequestMessages.requestId, requestId))
      .orderBy(wealthRequestMessages.createdAt);

    return rows.map((row: any) => ({
      id: row.id,
      requestId: row.requestId,
      authorId: row.authorId,
      content: row.content,
      createdAt: row.createdAt,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName || row.authorUsername || 'Unknown',
      },
    }));
  }

  async getMessageCount(requestId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(wealthRequestMessages)
      .where(eq(wealthRequestMessages.requestId, requestId));
    return result?.count ?? 0;
  }

  async findById(id: string): Promise<WealthRequestMessageRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(wealthRequestMessages)
      .where(eq(wealthRequestMessages.id, id));
    return row;
  }

  async getLastMessageByRequestId(
    requestId: string
  ): Promise<WealthRequestMessageRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(wealthRequestMessages)
      .where(eq(wealthRequestMessages.requestId, requestId))
      .orderBy(desc(wealthRequestMessages.createdAt))
      .limit(1);
    return row;
  }
}

// Default instance for production code paths
export const wealthRequestMessageRepository = new WealthRequestMessageRepository(realDb);
