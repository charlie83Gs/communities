// @ts-nocheck
// DEPRECATED: This repository is no longer used. Categories are now managed via the items table.
// This file is kept for reference but should not be used in new code.
import { db as realDb } from '../db/index';
// import { communityValueCategories } from '../db/schema'; // DEPRECATED: Now using items table
import { eq, and, isNull, inArray } from 'drizzle-orm';

export type CreateValueCategoryDto = {
  communityId: string;
  categoryName: string;
  categoryType:
    | 'care'
    | 'community_building'
    | 'creative'
    | 'knowledge'
    | 'maintenance'
    | 'material'
    | 'invisible_labor'
    | 'custom';
  unitType: 'hours' | 'sessions' | 'items' | 'events' | 'days' | 'custom';
  valuePerUnit?: string;
  description?: string;
  examples?: string[];
  proposedBy?: string;
  approvedBy?: string;
  sortOrder?: number;
};

export type UpdateValueCategoryDto = {
  categoryName?: string;
  valuePerUnit?: string;
  description?: string;
  examples?: string[];
  isActive?: boolean;
  sortOrder?: number;
  lastReviewedAt?: Date;
};

type DbClient = typeof realDb;

export class ValueCategoryRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  async create(data: CreateValueCategoryDto) {
    const [category] = await this.db.insert(communityValueCategories).values(data).returning();
    return category;
  }

  async findById(id: string) {
    const [category] = await this.db
      .select()
      .from(communityValueCategories)
      .where(and(eq(communityValueCategories.id, id), isNull(communityValueCategories.deletedAt)));
    return category;
  }

  async findByCommunityId(communityId: string, includeInactive = false) {
    const conditions = [
      eq(communityValueCategories.communityId, communityId),
      isNull(communityValueCategories.deletedAt),
    ];

    if (!includeInactive) {
      conditions.push(eq(communityValueCategories.isActive, true));
    }

    return await this.db
      .select()
      .from(communityValueCategories)
      .where(and(...conditions))
      .orderBy(communityValueCategories.sortOrder, communityValueCategories.categoryName);
  }

  async findByIds(ids: string[]) {
    return await this.db
      .select()
      .from(communityValueCategories)
      .where(
        and(inArray(communityValueCategories.id, ids), isNull(communityValueCategories.deletedAt))
      );
  }

  async findByCommunityAndName(communityId: string, categoryName: string) {
    const [category] = await this.db
      .select()
      .from(communityValueCategories)
      .where(
        and(
          eq(communityValueCategories.communityId, communityId),
          eq(communityValueCategories.categoryName, categoryName),
          isNull(communityValueCategories.deletedAt)
        )
      );
    return category;
  }

  async update(id: string, data: UpdateValueCategoryDto) {
    const [updated] = await this.db
      .update(communityValueCategories)
      .set(data)
      .where(and(eq(communityValueCategories.id, id), isNull(communityValueCategories.deletedAt)))
      .returning();
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .update(communityValueCategories)
      .set({ deletedAt: new Date() })
      .where(eq(communityValueCategories.id, id))
      .returning();
    return deleted;
  }

  async createDefaultCategories(communityId: string, createdBy: string) {
    const defaultCategories: CreateValueCategoryDto[] = [
      {
        communityId,
        categoryName: 'Care Work',
        categoryType: 'care',
        unitType: 'hours',
        valuePerUnit: '10',
        description: 'Elder care, child care, sick care, emotional support, disability assistance',
        examples: [
          'Elder care (hours)',
          'Child care (hours)',
          'Emotional support (sessions)',
          'Sick care (hours)',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 1,
      },
      {
        communityId,
        categoryName: 'Community Building',
        categoryType: 'community_building',
        unitType: 'hours',
        valuePerUnit: '10',
        description:
          'Welcoming new members, facilitating gatherings, conflict mediation, organizing',
        examples: [
          'Welcoming new members',
          'Facilitating gatherings (hours)',
          'Conflict mediation (sessions)',
          'Community organizing (hours)',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 2,
      },
      {
        communityId,
        categoryName: 'Creative & Cultural Work',
        categoryType: 'creative',
        unitType: 'hours',
        valuePerUnit: '10',
        description: 'Art creation, music performance, storytelling, cultural preservation',
        examples: [
          'Art creation (pieces)',
          'Music performance (hours)',
          'Storytelling (sessions)',
          'Design work (hours)',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 3,
      },
      {
        communityId,
        categoryName: 'Knowledge & Teaching',
        categoryType: 'knowledge',
        unitType: 'hours',
        valuePerUnit: '10',
        description: 'Teaching, tutoring, mentorship, skill sharing, workshop facilitation',
        examples: [
          'Teaching/tutoring (hours)',
          'Mentorship (sessions)',
          'Skill sharing (hours)',
          'Workshop facilitation (hours)',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 4,
      },
      {
        communityId,
        categoryName: 'Maintenance & Care of Spaces',
        categoryType: 'maintenance',
        unitType: 'hours',
        valuePerUnit: '10',
        description:
          'Cleaning shared spaces, garden maintenance, tool/equipment maintenance, infrastructure repair',
        examples: [
          'Cleaning shared spaces (hours)',
          'Garden maintenance (hours)',
          'Tool/equipment maintenance (hours)',
          'Infrastructure repair (hours)',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 5,
      },
      {
        communityId,
        categoryName: 'Material Sharing',
        categoryType: 'material',
        unitType: 'days',
        valuePerUnit: '10',
        description: 'Tool loans, vehicle sharing, space provision, food sharing, equipment loans',
        examples: [
          'Tool loans (item-days)',
          'Vehicle sharing (days)',
          'Space provision (hours)',
          'Food sharing (meals)',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 6,
      },
      {
        communityId,
        categoryName: 'Invisible Labor',
        categoryType: 'invisible_labor',
        unitType: 'sessions',
        valuePerUnit: '10',
        description:
          'Emotional labor, anticipatory care, relationship building, memory keeping, atmosphere creation',
        examples: [
          'Noticing needs',
          'Creating safety',
          'Introducing people',
          'Remembering birthdays',
          'Making spaces welcoming',
        ],
        proposedBy: createdBy,
        approvedBy: 'system_default',
        sortOrder: 7,
      },
    ];

    return await this.db.insert(communityValueCategories).values(defaultCategories).returning();
  }
}

// Default instance for production code paths
export const valueCategoryRepository = new ValueCategoryRepository(realDb);
