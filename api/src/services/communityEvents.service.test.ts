import { describe, it, expect, beforeEach } from 'bun:test';
import { CommunityEventsService } from './communityEvents.service';
import type { CommunityEventsRepository } from '../repositories/communityEvents.repository';

describe('CommunityEventsService', () => {
  let service: CommunityEventsService;
  let mockRepository: CommunityEventsRepository;

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      create: async (params) => ({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...params,
        createdAt: new Date(),
      }),
      listByCommunity: async () => [],
      listByType: async () => [],
      listByUser: async () => [],
      findById: async () => null,
    } as any;

    // Create service with mocked repository
    service = new CommunityEventsService(mockRepository as any);
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const params = {
        communityId: '123e4567-e89b-12d3-a456-426614174001',
        userId: 'user123',
        eventType: 'need_created' as const,
        entityType: 'need' as const,
        entityId: '123e4567-e89b-12d3-a456-426614174002',
        metadata: {
          itemName: 'Carrots',
          priority: 'need',
          unitsNeeded: 5,
        },
      };

      const result = await service.createEvent(params);

      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.communityId).toBe(params.communityId);
      expect(result.userId).toBe(params.userId);
      expect(result.eventType).toBe(params.eventType);
      expect(result.entityType).toBe(params.entityType);
      expect(result.entityId).toBe(params.entityId);
    });
  });
});
