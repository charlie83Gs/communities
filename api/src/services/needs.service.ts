import { needsRepository, NeedsRepository } from '@repositories/needs.repository';
import { councilRepository } from '@repositories/council.repository';
import { itemsRepository } from '@repositories/items.repository';
import { AppError } from '@utils/errors';
import { openFGAService } from './openfga.service';
import { communityEventsService } from './communityEvents.service';
import {
  CreateNeedDto,
  UpdateNeedDto,
  CreateCouncilNeedDto,
  UpdateCouncilNeedDto,
  CommunityNeedsAggregation,
} from '@types/needs.types';
import type {
  NeedRecord,
  CouncilNeedRecord,
  NeedListFilters,
  CouncilNeedListFilters,
} from '@repositories/needs.repository';

export class NeedsService {
  private repository: NeedsRepository;

  constructor(repository: NeedsRepository = needsRepository) {
    this.repository = repository;
  }

  // ========================================
  // MEMBER NEEDS
  // ========================================

  /**
   * Create a new member need
   */
  async createNeed(dto: CreateNeedDto, userId: string): Promise<NeedRecord> {
    // Check if user has permission to publish needs
    const canPublish = await openFGAService.checkAccess(
      userId,
      'community',
      dto.communityId,
      'can_publish_needs'
    );
    if (!canPublish) {
      throw new AppError(
        'Forbidden: you do not have permission to publish needs in this community',
        403
      );
    }

    // Validate item exists
    const item = await itemsRepository.findById(dto.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Validate recurring needs
    if (dto.isRecurring && !dto.recurrence) {
      throw new AppError('Recurrence frequency is required when isRecurring is true', 400);
    }

    // Calculate nextFulfillmentDate for recurring needs
    let nextFulfillmentDate: Date | null = null;
    if (dto.isRecurring && dto.recurrence) {
      nextFulfillmentDate = this.calculateNextFulfillmentDate(new Date(), dto.recurrence);
    }

    const need = await this.repository.createNeed({
      createdBy: userId,
      communityId: dto.communityId,
      itemId: dto.itemId,
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      unitsNeeded: dto.unitsNeeded,
      isRecurring: dto.isRecurring,
      recurrence: dto.recurrence ?? null,
      lastFulfilledAt: null,
      nextFulfillmentDate,
      status: 'active',
    });

    // Track event
    await communityEventsService.createEvent({
      communityId: dto.communityId,
      userId,
      eventType: 'need_created',
      entityType: 'need',
      entityId: need.id,
      metadata: {
        itemName: item.name,
        itemKind: item.kind,
        priority: dto.priority,
        unitsNeeded: dto.unitsNeeded,
        isRecurring: dto.isRecurring,
        recurrence: dto.recurrence,
      },
    });

    return need;
  }

  /**
   * Get a need by ID
   */
  async getNeed(id: string, userId: string): Promise<NeedRecord> {
    const need = await this.repository.findNeedById(id);
    if (!need) {
      throw new AppError('Need not found', 404);
    }

    // Check if user has permission to view needs in this community
    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      need.communityId,
      'can_view_needs'
    );
    if (!canView) {
      throw new AppError(
        'Forbidden: you do not have permission to view needs in this community',
        403
      );
    }

    return need;
  }

  /**
   * List needs with filters
   */
  async listNeeds(filters: NeedListFilters, userId: string): Promise<NeedRecord[]> {
    // If communityId is specified, check permission for that community
    if (filters.communityId) {
      const canView = await openFGAService.checkAccess(
        userId,
        'community',
        filters.communityId,
        'can_view_needs'
      );
      if (!canView) {
        throw new AppError(
          'Forbidden: you do not have permission to view needs in this community',
          403
        );
      }
      return await this.repository.listNeeds(filters);
    }

    // Otherwise, get all communities user has access to
    const communityIds = await openFGAService.getAccessibleResourceIds(
      userId,
      'community',
      'can_view_needs'
    );
    if (communityIds.length === 0) return [];

    // Get needs from all accessible communities
    const allNeeds: NeedRecord[] = [];
    for (const communityId of communityIds) {
      const needs = await this.repository.listNeeds({ ...filters, communityId });
      allNeeds.push(...needs);
    }

    // Sort by creation date (newest first)
    return allNeeds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update a need
   */
  async updateNeed(id: string, dto: UpdateNeedDto, userId: string): Promise<NeedRecord> {
    const need = await this.repository.findNeedById(id);
    if (!need) {
      throw new AppError('Need not found', 404);
    }

    // Only the creator can update their need
    if (need.createdBy !== userId) {
      throw new AppError('Forbidden: you can only update your own needs', 403);
    }

    // Validate recurring needs if being updated
    if (dto.isRecurring !== undefined) {
      if (dto.isRecurring && !dto.recurrence && !need.recurrence) {
        throw new AppError('Recurrence frequency is required when isRecurring is true', 400);
      }
    }

    // If changing recurrence settings, recalculate nextFulfillmentDate
    let nextFulfillmentDate = need.nextFulfillmentDate;
    if (dto.isRecurring !== undefined || dto.recurrence !== undefined) {
      const isRecurring = dto.isRecurring ?? need.isRecurring;
      const recurrence = dto.recurrence ?? need.recurrence;
      if (isRecurring && recurrence) {
        nextFulfillmentDate = this.calculateNextFulfillmentDate(new Date(), recurrence);
      } else {
        nextFulfillmentDate = null;
      }
    }

    const updated = await this.repository.updateNeed(id, {
      ...dto,
      nextFulfillmentDate,
    });

    if (!updated) {
      throw new AppError('Need not found', 404);
    }

    // Track event - check if status changed to fulfilled
    const eventType =
      updated.status === 'fulfilled' && need.status !== 'fulfilled'
        ? 'need_fulfilled'
        : 'need_updated';

    // Get item info for metadata
    const item = await itemsRepository.findById(updated.itemId);

    await communityEventsService.createEvent({
      communityId: updated.communityId,
      userId,
      eventType,
      entityType: 'need',
      entityId: updated.id,
      metadata: {
        itemName: item?.name,
        itemKind: item?.kind,
        priority: updated.priority,
        unitsNeeded: updated.unitsNeeded,
        isRecurring: updated.isRecurring,
        recurrence: updated.recurrence,
        status: updated.status,
      },
    });

    return updated;
  }

  /**
   * Delete a need (soft delete)
   */
  async deleteNeed(id: string, userId: string): Promise<void> {
    const need = await this.repository.findNeedById(id);
    if (!need) {
      throw new AppError('Need not found', 404);
    }

    // Only the creator can delete their need
    if (need.createdBy !== userId) {
      throw new AppError('Forbidden: you can only delete your own needs', 403);
    }

    await this.repository.deleteNeed(id);

    // Track event
    const item = await itemsRepository.findById(need.itemId);

    await communityEventsService.createEvent({
      communityId: need.communityId,
      userId,
      eventType: 'need_deleted',
      entityType: 'need',
      entityId: need.id,
      metadata: {
        itemName: item?.name,
        itemKind: item?.kind,
        priority: need.priority,
        unitsNeeded: need.unitsNeeded,
        isRecurring: need.isRecurring,
        recurrence: need.recurrence,
      },
    });
  }

  /**
   * Get aggregated needs for a community
   */
  async getAggregatedNeeds(
    communityId: string,
    userId: string
  ): Promise<CommunityNeedsAggregation> {
    // Check if user has permission to view needs in this community
    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_needs'
    );
    if (!canView) {
      throw new AppError(
        'Forbidden: you do not have permission to view needs in this community',
        403
      );
    }

    // Get aggregated member needs
    const memberNeeds = await this.repository.aggregateCommunityNeeds(communityId);

    // Get aggregated council needs
    const councilNeeds = await this.repository.aggregateCouncilNeeds(communityId);

    // Combine and separate by priority
    const allAggregations = [...memberNeeds, ...councilNeeds];

    const needs = allAggregations.filter((n) => n.priority === 'need');
    const wants = allAggregations.filter((n) => n.priority === 'want');

    return { needs, wants };
  }

  // ========================================
  // COUNCIL NEEDS
  // ========================================

  /**
   * Create a new council need
   */
  async createCouncilNeed(dto: CreateCouncilNeedDto, userId: string): Promise<CouncilNeedRecord> {
    // Check if user is a manager of the council
    const canManage = await openFGAService.checkAccess(
      userId,
      'council',
      dto.councilId,
      'can_manage'
    );
    if (!canManage) {
      throw new AppError('Forbidden: you do not have permission to manage this council', 403);
    }

    // Verify council exists and belongs to the community
    const council = await councilRepository.findById(dto.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }
    if (council.communityId !== dto.communityId) {
      throw new AppError('Council does not belong to the specified community', 400);
    }

    // Validate item exists
    const item = await itemsRepository.findById(dto.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Validate recurring needs
    if (dto.isRecurring && !dto.recurrence) {
      throw new AppError('Recurrence frequency is required when isRecurring is true', 400);
    }

    // Calculate nextFulfillmentDate for recurring needs
    let nextFulfillmentDate: Date | null = null;
    if (dto.isRecurring && dto.recurrence) {
      nextFulfillmentDate = this.calculateNextFulfillmentDate(new Date(), dto.recurrence);
    }

    const need = await this.repository.createCouncilNeed({
      councilId: dto.councilId,
      createdBy: userId,
      communityId: dto.communityId,
      itemId: dto.itemId,
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      unitsNeeded: dto.unitsNeeded,
      isRecurring: dto.isRecurring,
      recurrence: dto.recurrence ?? null,
      lastFulfilledAt: null,
      nextFulfillmentDate,
      status: 'active',
    });

    return need;
  }

  /**
   * Get a council need by ID
   */
  async getCouncilNeed(id: string, userId: string): Promise<CouncilNeedRecord> {
    const need = await this.repository.findCouncilNeedById(id);
    if (!need) {
      throw new AppError('Council need not found', 404);
    }

    // Check if user has permission to view needs in this community
    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      need.communityId,
      'can_view_needs'
    );
    if (!canView) {
      throw new AppError(
        'Forbidden: you do not have permission to view needs in this community',
        403
      );
    }

    return need;
  }

  /**
   * List council needs with filters
   */
  async listCouncilNeeds(
    filters: CouncilNeedListFilters,
    userId: string
  ): Promise<CouncilNeedRecord[]> {
    // If communityId is specified, check permission for that community
    if (filters.communityId) {
      const canView = await openFGAService.checkAccess(
        userId,
        'community',
        filters.communityId,
        'can_view_needs'
      );
      if (!canView) {
        throw new AppError(
          'Forbidden: you do not have permission to view needs in this community',
          403
        );
      }
      return await this.repository.listCouncilNeeds(filters);
    }

    // If councilId is specified, check permission for that council's community
    if (filters.councilId) {
      const council = await councilRepository.findById(filters.councilId);
      if (!council) {
        throw new AppError('Council not found', 404);
      }
      const canView = await openFGAService.checkAccess(
        userId,
        'community',
        council.communityId,
        'can_view_needs'
      );
      if (!canView) {
        throw new AppError(
          'Forbidden: you do not have permission to view needs in this community',
          403
        );
      }
      return await this.repository.listCouncilNeeds(filters);
    }

    // Otherwise, get all communities user has access to
    const communityIds = await openFGAService.getAccessibleResourceIds(
      userId,
      'community',
      'can_view_needs'
    );
    if (communityIds.length === 0) return [];

    // Get council needs from all accessible communities
    const allNeeds: CouncilNeedRecord[] = [];
    for (const communityId of communityIds) {
      const needs = await this.repository.listCouncilNeeds({ ...filters, communityId });
      allNeeds.push(...needs);
    }

    // Sort by creation date (newest first)
    return allNeeds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update a council need
   */
  async updateCouncilNeed(
    id: string,
    dto: UpdateCouncilNeedDto,
    userId: string
  ): Promise<CouncilNeedRecord> {
    const need = await this.repository.findCouncilNeedById(id);
    if (!need) {
      throw new AppError('Council need not found', 404);
    }

    // Check if user is a manager of the council
    const canManage = await openFGAService.checkAccess(
      userId,
      'council',
      need.councilId,
      'can_manage'
    );
    if (!canManage) {
      throw new AppError('Forbidden: you do not have permission to manage this council', 403);
    }

    // Validate recurring needs if being updated
    if (dto.isRecurring !== undefined) {
      if (dto.isRecurring && !dto.recurrence && !need.recurrence) {
        throw new AppError('Recurrence frequency is required when isRecurring is true', 400);
      }
    }

    // If changing recurrence settings, recalculate nextFulfillmentDate
    let nextFulfillmentDate = need.nextFulfillmentDate;
    if (dto.isRecurring !== undefined || dto.recurrence !== undefined) {
      const isRecurring = dto.isRecurring ?? need.isRecurring;
      const recurrence = dto.recurrence ?? need.recurrence;
      if (isRecurring && recurrence) {
        nextFulfillmentDate = this.calculateNextFulfillmentDate(new Date(), recurrence);
      } else {
        nextFulfillmentDate = null;
      }
    }

    const updated = await this.repository.updateCouncilNeed(id, {
      ...dto,
      nextFulfillmentDate,
    });

    if (!updated) {
      throw new AppError('Council need not found', 404);
    }

    return updated;
  }

  /**
   * Delete a council need (soft delete)
   */
  async deleteCouncilNeed(id: string, userId: string): Promise<void> {
    const need = await this.repository.findCouncilNeedById(id);
    if (!need) {
      throw new AppError('Council need not found', 404);
    }

    // Check if user is a manager of the council
    const canManage = await openFGAService.checkAccess(
      userId,
      'council',
      need.councilId,
      'can_manage'
    );
    if (!canManage) {
      throw new AppError('Forbidden: you do not have permission to manage this council', 403);
    }

    await this.repository.deleteCouncilNeed(id);
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Calculate the next fulfillment date based on recurrence frequency
   */
  private calculateNextFulfillmentDate(
    fromDate: Date,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Date {
    const nextDate = new Date(fromDate);
    if (frequency === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  }

  /**
   * Replenish all needs that are due for replenishment
   * This method is called by the daily cron job
   * @returns Summary of replenishment results
   */
  async replenishDueNeeds(): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    errors: Array<{ needId: string; error: string }>;
  }> {
    const now = new Date();

    // Get both member needs and council needs due for replenishment
    const [dueMemberNeeds, dueCouncilNeeds] = await Promise.all([
      this.repository.findMemberNeedsDueForReplenishment(now),
      this.repository.findCouncilNeedsDueForReplenishment(now),
    ]);

    const results = {
      total: dueMemberNeeds.length + dueCouncilNeeds.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ needId: string; error: string }>,
    };

    // Process member needs
    for (const need of dueMemberNeeds) {
      try {
        if (!need.recurrence) {
          results.failed++;
          results.errors.push({
            needId: need.id,
            error: 'Missing recurrence configuration',
          });
          continue;
        }

        const nextFulfillmentDate = this.calculateNextFulfillmentDate(now, need.recurrence);
        await this.repository.updateNeedFulfillmentDates(need.id, now, nextFulfillmentDate);
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          needId: need.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Failed to replenish member need ${need.id}:`, error);
      }
    }

    // Process council needs
    for (const need of dueCouncilNeeds) {
      try {
        if (!need.recurrence) {
          results.failed++;
          results.errors.push({
            needId: need.id,
            error: 'Missing recurrence configuration',
          });
          continue;
        }

        const nextFulfillmentDate = this.calculateNextFulfillmentDate(now, need.recurrence);
        await this.repository.updateCouncilNeedFulfillmentDates(need.id, now, nextFulfillmentDate);
        results.succeeded++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          needId: need.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Failed to replenish council need ${need.id}:`, error);
      }
    }

    return results;
  }
}

export const needsService = new NeedsService();
