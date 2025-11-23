import {
  communityEventsRepository,
  CommunityEventsRepository,
} from '../repositories/communityEvents.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import type {
  CommunityEventType,
  CommunityEntityType,
} from '../repositories/communityEvents.repository';

export type CommunityEventFilters = {
  eventType?: CommunityEventType;
  limit?: number;
  offset?: number;
};

export class CommunityEventsService {
  private repository: CommunityEventsRepository;

  constructor(repository: CommunityEventsRepository = communityEventsRepository) {
    this.repository = repository;
  }

  /**
   * Create a new community event
   * This is an internal method called by other services
   */
  async createEvent(params: {
    communityId: string;
    userId: string;
    eventType: CommunityEventType;
    entityType: CommunityEntityType;
    entityId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
  }) {
    try {
      const event = await this.repository.create(params);
      logger.debug(
        `[CommunityEventsService] Created event: ${params.eventType} for entity ${params.entityId}`
      );
      return event;
    } catch (error) {
      // Silently log and swallow errors - event creation is non-critical
      // and shouldn't break the main application flow
      logger.error('[CommunityEventsService] Error creating event:', error);
      return null;
    }
  }

  /**
   * Get community events with authorization check
   */
  async getCommunityEvents(
    communityId: string,
    userId: string,
    filters: CommunityEventFilters = {}
  ) {
    // Check if user is a member of the community
    const isMember = await communityMemberRepository.isMember(communityId, userId);
    if (!isMember) {
      throw new AppError('Forbidden: you must be a community member to view events', 403);
    }

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    // If filtering by event type
    if (filters.eventType) {
      return await this.repository.listByType(communityId, filters.eventType, limit, offset);
    }

    // Otherwise get all events
    return await this.repository.listByCommunity(communityId, limit, offset);
  }

  /**
   * Get events for a specific user in a community
   */
  async getUserEvents(
    communityId: string,
    requesterId: string,
    targetUserId: string,
    limit = 50,
    offset = 0
  ) {
    // Check if requester is a member of the community
    const isMember = await communityMemberRepository.isMember(communityId, requesterId);
    if (!isMember) {
      throw new AppError('Forbidden: you must be a community member to view events', 403);
    }

    return await this.repository.listByUser(communityId, targetUserId, limit, offset);
  }
}

export const communityEventsService = new CommunityEventsService();
