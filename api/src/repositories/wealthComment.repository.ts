import { db as realDb } from '@db/index';
import { wealthComments } from '@db/schema';
import { eq } from 'drizzle-orm';
import { CreateWealthCommentDto, UpdateWealthCommentDto } from '../types/wealth.types';

export class WealthCommentRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async create(data: CreateWealthCommentDto) {
    const [comment] = await this.db.insert(wealthComments).values(data).returning();
    return comment;
  }

  async findById(id: string) {
    const [comment] = await this.db.select().from(wealthComments).where(eq(wealthComments.id, id));
    return comment;
  }

  async findByWealthId(wealthId: string, limit = 50, offset = 0) {
    return await this.db
      .select()
      .from(wealthComments)
      .where(eq(wealthComments.wealthId, wealthId))
      .orderBy(wealthComments.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async update(id: string, data: UpdateWealthCommentDto) {
    const [updated] = await this.db
      .update(wealthComments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wealthComments.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(wealthComments)
      .where(eq(wealthComments.id, id))
      .returning();
    return deleted;
  }
}

// Default instance for production code paths
export const wealthCommentRepository = new WealthCommentRepository(realDb);
