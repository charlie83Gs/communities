import { db as realDb } from '@/db';
import { userSkills, skillEndorsements } from '@/db/schema';
import { items } from '@/db/schema/items.schema';
import { eq, and, isNull, sql, desc, ilike } from 'drizzle-orm';
import type {
  UserSkill,
  SkillWithEndorsements,
  ContextualSkillSuggestion,
} from '@/types/skills.types';

/**
 * Skills Repository
 *
 * Handles all database operations for skills and endorsements.
 * Skills are user-scoped (global to user).
 * Endorsements are community-scoped (local reputation).
 */
class SkillsRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Get all skills for a user with endorsement counts for a specific community
   */
  async getUserSkills(
    userId: string,
    communityId: string,
    viewerId: string
  ): Promise<SkillWithEndorsements[]> {
    // Query to get skills with endorsement counts and viewer's endorsement status
    const results = await this.db
      .select({
        id: userSkills.id,
        name: userSkills.name,
        endorsementCount: sql<number>`
          COALESCE(
            COUNT(CASE WHEN ${skillEndorsements.deletedAt} IS NULL THEN 1 END),
            0
          )::int
        `,
        isEndorsedByMe: sql<boolean>`
          BOOL_OR(
            ${skillEndorsements.endorserId} = ${viewerId}
            AND ${skillEndorsements.deletedAt} IS NULL
          )
        `,
      })
      .from(userSkills)
      .leftJoin(
        skillEndorsements,
        and(
          eq(skillEndorsements.skillId, userSkills.id),
          eq(skillEndorsements.communityId, communityId)
        )
      )
      .where(and(eq(userSkills.userId, userId), isNull(userSkills.deletedAt)))
      .groupBy(userSkills.id, userSkills.name)
      .orderBy(desc(sql`COUNT(CASE WHEN ${skillEndorsements.deletedAt} IS NULL THEN 1 END)`));

    return results.map((r: any) => ({
      id: r.id,
      name: r.name,
      endorsementCount: r.endorsementCount || 0,
      isEndorsedByMe: r.isEndorsedByMe || false,
    }));
  }

  /**
   * Get top N skills for a user in a community (sorted by endorsement count)
   */
  async getTopSkills(
    userId: string,
    communityId: string,
    limit: number
  ): Promise<SkillWithEndorsements[]> {
    const results = await this.db
      .select({
        id: userSkills.id,
        name: userSkills.name,
        endorsementCount: sql<number>`
          COALESCE(
            COUNT(CASE WHEN ${skillEndorsements.deletedAt} IS NULL THEN 1 END),
            0
          )::int
        `,
      })
      .from(userSkills)
      .leftJoin(
        skillEndorsements,
        and(
          eq(skillEndorsements.skillId, userSkills.id),
          eq(skillEndorsements.communityId, communityId)
        )
      )
      .where(and(eq(userSkills.userId, userId), isNull(userSkills.deletedAt)))
      .groupBy(userSkills.id, userSkills.name)
      .orderBy(desc(sql`COUNT(CASE WHEN ${skillEndorsements.deletedAt} IS NULL THEN 1 END)`))
      .limit(limit);

    return results.map((r: any) => ({
      id: r.id,
      name: r.name,
      endorsementCount: r.endorsementCount || 0,
      isEndorsedByMe: false, // Not needed for top skills display
    }));
  }

  /**
   * Create a new skill for a user
   * Handles case-insensitive duplicate prevention
   */
  async createSkill(userId: string, name: string): Promise<UserSkill> {
    const trimmedName = name.trim();

    // Check for case-insensitive duplicate
    const existing = await this.db
      .select()
      .from(userSkills)
      .where(
        and(
          eq(userSkills.userId, userId),
          sql`LOWER(${userSkills.name}) = LOWER(${trimmedName})`,
          isNull(userSkills.deletedAt)
        )
      );

    if (existing.length > 0) {
      throw new Error('Skill already exists');
    }

    const [skill] = await this.db
      .insert(userSkills)
      .values({
        userId,
        name: trimmedName,
      })
      .returning();

    return skill;
  }

  /**
   * Soft delete a skill
   */
  async deleteSkill(skillId: string, userId: string): Promise<UserSkill | undefined> {
    const [deleted] = await this.db
      .update(userSkills)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(userSkills.id, skillId), eq(userSkills.userId, userId), isNull(userSkills.deletedAt))
      )
      .returning();

    return deleted;
  }

  /**
   * Get a skill by ID
   */
  async getSkillById(skillId: string): Promise<UserSkill | undefined> {
    const [skill] = await this.db
      .select()
      .from(userSkills)
      .where(and(eq(userSkills.id, skillId), isNull(userSkills.deletedAt)));

    return skill;
  }

  /**
   * Endorse a skill in a community
   * Creates or restores (un-soft-deletes) an endorsement
   */
  async endorseSkill(skillId: string, endorserId: string, communityId: string): Promise<void> {
    // Check if endorsement already exists (including soft-deleted)
    const [existing] = await this.db
      .select()
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.endorserId, endorserId),
          eq(skillEndorsements.communityId, communityId)
        )
      );

    if (existing) {
      // If soft-deleted, restore it
      if (existing.deletedAt) {
        await this.db
          .update(skillEndorsements)
          .set({ deletedAt: null })
          .where(eq(skillEndorsements.id, existing.id));
      }
      // If already active, do nothing (idempotent)
    } else {
      // Create new endorsement
      await this.db.insert(skillEndorsements).values({
        skillId,
        endorserId,
        communityId,
      });
    }
  }

  /**
   * Remove an endorsement (soft delete)
   */
  async removeEndorsement(skillId: string, endorserId: string, communityId: string): Promise<void> {
    await this.db
      .update(skillEndorsements)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.endorserId, endorserId),
          eq(skillEndorsements.communityId, communityId),
          isNull(skillEndorsements.deletedAt)
        )
      );
  }

  /**
   * Get contextual skill suggestions for endorsement flow
   * If itemId provided, prioritize skills matching item's relatedSkills
   */
  async getSuggestedSkills(
    userId: string,
    communityId: string,
    viewerId: string,
    itemId?: string
  ): Promise<ContextualSkillSuggestion[]> {
    // Get all user's skills with endorsement data
    const allSkills = await this.getUserSkills(userId, communityId, viewerId);

    // If no itemId, return all skills sorted by endorsement count
    if (!itemId) {
      return allSkills.map((skill) => ({
        skillId: skill.id,
        skillName: skill.name,
        isRelated: false,
        endorsementCount: skill.endorsementCount,
        isEndorsedByMe: skill.isEndorsedByMe,
      }));
    }

    // Get item's related skills
    const [item] = await this.db
      .select({ relatedSkills: items.relatedSkills })
      .from(items)
      .where(and(eq(items.id, itemId), isNull(items.deletedAt)));

    const relatedSkillNames = item?.relatedSkills || [];

    // Mark which skills are related (case-insensitive match)
    const suggestions = allSkills.map((skill) => ({
      skillId: skill.id,
      skillName: skill.name,
      isRelated: relatedSkillNames.some(
        (rs: string) => rs.toLowerCase() === skill.name.toLowerCase()
      ),
      endorsementCount: skill.endorsementCount,
      isEndorsedByMe: skill.isEndorsedByMe,
    }));

    // Sort: related skills first, then by endorsement count
    return suggestions.sort((a, b) => {
      if (a.isRelated !== b.isRelated) {
        return a.isRelated ? -1 : 1;
      }
      return b.endorsementCount - a.endorsementCount;
    });
  }

  /**
   * Check if user has endorsed a specific skill
   */
  async hasEndorsed(skillId: string, endorserId: string, communityId: string): Promise<boolean> {
    const [endorsement] = await this.db
      .select()
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.endorserId, endorserId),
          eq(skillEndorsements.communityId, communityId),
          isNull(skillEndorsements.deletedAt)
        )
      );

    return !!endorsement;
  }

  /**
   * Get endorsement count for a skill in a community
   */
  async getEndorsementCount(skillId: string, communityId: string): Promise<number> {
    const [result] = await this.db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.communityId, communityId),
          isNull(skillEndorsements.deletedAt)
        )
      );

    return result?.count || 0;
  }

  /**
   * Search skills by name (for future search feature)
   */
  async searchSkills(query: string, limit: number = 20): Promise<UserSkill[]> {
    return await this.db
      .select()
      .from(userSkills)
      .where(and(ilike(userSkills.name, `%${query}%`), isNull(userSkills.deletedAt)))
      .limit(limit);
  }
}

// Default instance for production code
export const skillsRepository = new SkillsRepository(realDb);

// Export class for testing
export { SkillsRepository };
