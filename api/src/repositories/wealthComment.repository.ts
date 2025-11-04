import { db } from '@db/index';
import { wealthComments } from '@db/schema';
import { eq } from 'drizzle-orm';
import { CreateWealthCommentDto, UpdateWealthCommentDto } from '../types/wealth.types';

export class WealthCommentRepository {
  async create(data: CreateWealthCommentDto) {
    const [comment] = await db
      .insert(wealthComments)
      .values(data)
      .returning();
    return comment;
  }

  async findById(id: string) {
    const [comment] = await db
      .select()
      .from(wealthComments)
      .where(eq(wealthComments.id, id));
    return comment;
  }

  async findByWealthId(wealthId: string, limit = 50, offset = 0) {
    return await db
      .select()
      .from(wealthComments)
      .where(eq(wealthComments.wealthId, wealthId))
      .orderBy(wealthComments.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async update(id: string, data: UpdateWealthCommentDto) {
    const [updated] = await db
      .update(wealthComments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wealthComments.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(wealthComments)
      .where(eq(wealthComments.id, id))
      .returning();
    return deleted;
  }
}

export const wealthCommentRepository = new WealthCommentRepository();
