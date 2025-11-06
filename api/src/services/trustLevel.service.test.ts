/**
 * TrustLevel Service Unit Tests
 *
 * Test Coverage:
 * - Permission checks for trust level management
 * - CRUD operations for trust levels
 * - Trust threshold resolution
 * - Validation logic
 * - Error handling
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { trustLevelService } from './trustLevel.service';
import { trustLevelRepository } from '@/repositories/trustLevel.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { communityRepository } from '@/repositories/community.repository';

// Mock repositories
const mockTrustLevelRepository = {
  create: mock(),
  findByCommunityId: mock(),
  findById: mock(),
  findByName: mock(),
  update: mock(),
  delete: mock(),
  createDefaultLevels: mock(),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(),
  isAdmin: mock(),
};

const mockCommunityRepository = {
  findById: mock(),
};

describe('TrustLevelService', () => {
  const validCommunityId = '550e8400-e29b-41d4-a716-446655440001';
  const validUserId = '550e8400-e29b-41d4-a716-446655440002';
  const validLevelId = '550e8400-e29b-41d4-a716-446655440003';

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockTrustLevelRepository).forEach(m => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach(m => m.mockReset());
    Object.values(mockCommunityRepository).forEach(m => m.mockReset());

    // Replace dependencies with mocks
    (trustLevelRepository.create as any) = mockTrustLevelRepository.create;
    (trustLevelRepository.findByCommunityId as any) = mockTrustLevelRepository.findByCommunityId;
    (trustLevelRepository.findById as any) = mockTrustLevelRepository.findById;
    (trustLevelRepository.findByName as any) = mockTrustLevelRepository.findByName;
    (trustLevelRepository.update as any) = mockTrustLevelRepository.update;
    (trustLevelRepository.delete as any) = mockTrustLevelRepository.delete;
    (trustLevelRepository.createDefaultLevels as any) = mockTrustLevelRepository.createDefaultLevels;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.isAdmin as any) = mockCommunityMemberRepository.isAdmin;
    (communityRepository.findById as any) = mockCommunityRepository.findById;

    // Default mock behaviors
    mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
    mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);
    mockCommunityRepository.findById.mockResolvedValue({ id: validCommunityId, name: 'Test Community' });
  });

  describe('createTrustLevel', () => {
    it('should allow admin to create trust level', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockTrustLevelRepository.findByName.mockResolvedValue(undefined);
      mockTrustLevelRepository.create.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await trustLevelService.createTrustLevel(
        validCommunityId,
        {
          name: 'Trusted',
          threshold: 50,
        },
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Trusted');
      expect(mockTrustLevelRepository.create).toHaveBeenCalled();
    });

    it('should reject non-admin from creating trust level', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        trustLevelService.createTrustLevel(
          validCommunityId,
          { name: 'Trusted', threshold: 50 },
          validUserId
        )
      ).rejects.toThrow('Only admins can create trust levels');
    });

    it('should validate threshold is non-negative', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);

      await expect(
        trustLevelService.createTrustLevel(
          validCommunityId,
          { name: 'Trusted', threshold: -5 },
          validUserId
        )
      ).rejects.toThrow('Threshold must be non-negative');
    });

    it('should prevent duplicate trust level names', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockTrustLevelRepository.findByName.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });

      await expect(
        trustLevelService.createTrustLevel(
          validCommunityId,
          { name: 'Trusted', threshold: 60 },
          validUserId
        )
      ).rejects.toThrow('A trust level with this name already exists');
    });
  });

  describe('getTrustLevel', () => {
    it('should allow member to get trust level by ID', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      const result = await trustLevelService.getTrustLevel(validLevelId, validUserId);

      expect(result).toBeDefined();
      expect(result.name).toBe('Trusted');
    });

    it('should reject non-member from getting trust level', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustLevelService.getTrustLevel(validLevelId, validUserId)).rejects.toThrow('Forbidden');
    });

    it('should handle non-existent trust level', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue(undefined);

      await expect(trustLevelService.getTrustLevel(validLevelId, validUserId)).rejects.toThrow('Trust level not found');
    });
  });

  describe('listTrustLevels', () => {
    it('should allow member to list trust levels', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustLevelRepository.findByCommunityId.mockResolvedValue([
        { id: validLevelId, communityId: validCommunityId, name: 'Trusted', threshold: 50 },
      ]);

      const result = await trustLevelService.listTrustLevels(validCommunityId, validUserId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should reject non-member from listing trust levels', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustLevelService.listTrustLevels(validCommunityId, validUserId)).rejects.toThrow('Forbidden');
    });
  });

  describe('updateTrustLevel', () => {
    it('should allow admin to update trust level', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockTrustLevelRepository.findByName.mockResolvedValue(undefined);
      mockTrustLevelRepository.update.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Very Trusted',
        threshold: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await trustLevelService.updateTrustLevel(
        validLevelId,
        { name: 'Very Trusted', threshold: 60 },
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Very Trusted');
    });

    it('should reject non-admin from updating trust level', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        trustLevelService.updateTrustLevel(validLevelId, { name: 'Updated' }, validUserId)
      ).rejects.toThrow('Only admins can update trust levels');
    });

    it('should validate threshold if provided', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);

      await expect(
        trustLevelService.updateTrustLevel(validLevelId, { threshold: -10 }, validUserId)
      ).rejects.toThrow('Threshold must be non-negative');
    });
  });

  describe('deleteTrustLevel', () => {
    it('should allow admin to delete trust level', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockTrustLevelRepository.delete.mockResolvedValue(undefined);

      await trustLevelService.deleteTrustLevel(validLevelId, validUserId);

      expect(mockTrustLevelRepository.delete).toHaveBeenCalledWith(validLevelId);
    });

    it('should reject non-admin from deleting trust level', async () => {
      mockTrustLevelRepository.findById.mockResolvedValue({
        id: validLevelId,
        communityId: validCommunityId,
        name: 'Trusted',
        threshold: 50,
      });
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(trustLevelService.deleteTrustLevel(validLevelId, validUserId)).rejects.toThrow('Only admins can delete trust levels');
    });
  });

  describe('initializeDefaultLevels', () => {
    it('should create default trust levels for new community', async () => {
      mockTrustLevelRepository.findByCommunityId.mockResolvedValue([]);
      mockTrustLevelRepository.createDefaultLevels.mockResolvedValue([
        { id: '1', communityId: validCommunityId, name: 'New', threshold: 0 },
        { id: '2', communityId: validCommunityId, name: 'Stable', threshold: 10 },
        { id: '3', communityId: validCommunityId, name: 'Trusted', threshold: 50 },
      ]);

      const result = await trustLevelService.initializeDefaultLevels(validCommunityId);

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });

    it('should skip initialization if levels already exist', async () => {
      mockTrustLevelRepository.findByCommunityId.mockResolvedValue([
        { id: validLevelId, communityId: validCommunityId, name: 'Existing', threshold: 0 },
      ]);

      const result = await trustLevelService.initializeDefaultLevels(validCommunityId);

      expect(result.length).toBe(1);
      expect(mockTrustLevelRepository.createDefaultLevels).not.toHaveBeenCalled();
    });
  });
});
