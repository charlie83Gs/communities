/**
 * Council Service Unit Tests
 *
 * Test Coverage:
 * - Permission checks for council operations
 * - Council CRUD operations
 * - Trust management for councils
 * - Manager assignment
 * - Inventory and transaction tracking
 * - Error handling
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { councilService } from './council.service';
import { councilRepository } from '@/repositories/council.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { appUserRepository } from '@/repositories/appUser.repository';
import { itemsRepository } from '@/repositories/items.repository';
import { poolsRepository } from '@/repositories/pools.repository';
import { openFGAService } from './openfga.service';

// Mock repositories
const mockCouncilRepository = {
  create: mock(),
  findByCommunityId: mock(),
  findById: mock(),
  update: mock(),
  delete: mock(),
  getTrustScore: mock(),
  getMemberCount: mock(),
  getManagers: mock(),
  getInventory: mock(),
  getTransactions: mock(),
  addManager: mock(),
  removeManager: mock(),
  isManager: mock(),
  hasAwardedTrust: mock(),
  awardTrust: mock(),
  removeTrust: mock(),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(),
  isAdmin: mock(),
};

const mockOpenFGAService = {
  checkAccess: mock(),
  assignRelation: mock(),
  revokeRelation: mock(),
};

const mockAppUserRepository = {
  findById: mock(),
};

const mockItemsRepository = {
  findById: mock(),
};

const mockPoolsRepository = {
  listByCouncil: mock(),
  getInventory: mock(),
};

describe('CouncilService', () => {
  const validCommunityId = '550e8400-e29b-41d4-a716-446655440001';
  const validUserId = '550e8400-e29b-41d4-a716-446655440002';
  const validCouncilId = '550e8400-e29b-41d4-a716-446655440003';

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockCouncilRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockItemsRepository).forEach((m) => m.mockReset());
    Object.values(mockPoolsRepository).forEach((m) => m.mockReset());

    // Replace dependencies with mocks
    (councilRepository.create as any) = mockCouncilRepository.create;
    (councilRepository.findByCommunityId as any) = mockCouncilRepository.findByCommunityId;
    (councilRepository.findById as any) = mockCouncilRepository.findById;
    (councilRepository.update as any) = mockCouncilRepository.update;
    (councilRepository.delete as any) = mockCouncilRepository.delete;
    (councilRepository.getTrustScore as any) = mockCouncilRepository.getTrustScore;
    (councilRepository.getMemberCount as any) = mockCouncilRepository.getMemberCount;
    (councilRepository.getManagers as any) = mockCouncilRepository.getManagers;
    (councilRepository.addManager as any) = mockCouncilRepository.addManager;
    (councilRepository.removeManager as any) = mockCouncilRepository.removeManager;
    (councilRepository.isManager as any) = mockCouncilRepository.isManager;
    (councilRepository.hasAwardedTrust as any) = mockCouncilRepository.hasAwardedTrust;
    (councilRepository.awardTrust as any) = mockCouncilRepository.awardTrust;
    (councilRepository.removeTrust as any) = mockCouncilRepository.removeTrust;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.isAdmin as any) = mockCommunityMemberRepository.isAdmin;
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
    (openFGAService.assignRelation as any) = mockOpenFGAService.assignRelation;
    (openFGAService.revokeRelation as any) = mockOpenFGAService.revokeRelation;
    (appUserRepository.findById as any) = mockAppUserRepository.findById;
    (itemsRepository.findById as any) = mockItemsRepository.findById;
    (poolsRepository.listByCouncil as any) = mockPoolsRepository.listByCouncil;
    (poolsRepository.getInventory as any) = mockPoolsRepository.getInventory;

    // Default mock behaviors
    mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
    mockOpenFGAService.checkAccess.mockResolvedValue(false);
    mockPoolsRepository.listByCouncil.mockResolvedValue([]);
  });

  describe('createCouncil', () => {
    it('should allow user with can_create_council permission', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true); // Has permission
      mockCouncilRepository.findByCommunityId.mockResolvedValue({
        councils: [],
        total: 0,
      });
      mockCouncilRepository.create.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        description: 'Manages food resources in the community',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCouncilRepository.addManager.mockResolvedValue(undefined);

      const result = await councilService.createCouncil(
        {
          communityId: validCommunityId,
          name: 'Food Council',
          description: 'Manages food resources in the community',
        } as any,
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(validCouncilId);
      expect(mockCouncilRepository.create).toHaveBeenCalled();
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'community',
        validCommunityId,
        'can_create_council'
      );
    });

    it('should reject user without can_create_council permission', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(false); // No permission

      await expect(
        councilService.createCouncil(
          {
            communityId: validCommunityId,
            name: 'Food Council',
            description: 'Manages food resources',
          } as any,
          validUserId
        )
      ).rejects.toThrow('Forbidden');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'community',
        validCommunityId,
        'can_create_council'
      );
    });

    it('should validate name length', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockOpenFGAService.checkAccess.mockResolvedValue(true);

      await expect(
        councilService.createCouncil(
          {
            communityId: validCommunityId,
            name: 'AB', // Too short
            description: 'Valid description here for testing',
          } as any,
          validUserId
        )
      ).rejects.toThrow('Council name must be between 3 and 100 characters');
    });
  });

  describe('listCouncils', () => {
    it('should allow member to list councils', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCouncilRepository.findByCommunityId.mockResolvedValue({
        councils: [
          {
            id: validCouncilId,
            name: 'Food Council',
            description: 'Manages food',
            trustScore: 15,
            createdAt: new Date(),
            createdBy: validUserId,
          },
        ],
        total: 1,
      });
      mockCouncilRepository.getMemberCount.mockResolvedValue(5);

      const result = await councilService.listCouncils(validCommunityId, validUserId);

      expect(result).toBeDefined();
      expect(result.councils).toBeDefined();
      expect(Array.isArray(result.councils)).toBe(true);
    });

    it('should reject non-member from listing councils', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(councilService.listCouncils(validCommunityId, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });
  });

  describe('getCouncil', () => {
    it('should allow member to get council by ID', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        description: 'Manages food',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCouncilRepository.getTrustScore.mockResolvedValue(15);
      mockCouncilRepository.getMemberCount.mockResolvedValue(5);
      mockCouncilRepository.getManagers.mockResolvedValue([]);
      mockPoolsRepository.listByCouncil.mockResolvedValue([]);

      const result = await councilService.getCouncil(validCouncilId, validUserId);

      expect(result).toBeDefined();
      expect(result.id).toBe(validCouncilId);
    });

    it('should reject non-member from getting council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(councilService.getCouncil(validCouncilId, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });

    it('should handle non-existent council', async () => {
      mockCouncilRepository.findById.mockResolvedValue(null as any);

      await expect(councilService.getCouncil(validCouncilId, validUserId)).rejects.toThrow(
        'Council not found'
      );
    });
  });

  describe('updateCouncil', () => {
    it('should allow user with can_update permission to update council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(true); // Has permission
      mockCouncilRepository.findByCommunityId.mockResolvedValue({
        councils: [],
        total: 0,
      });
      mockCouncilRepository.update.mockResolvedValue({
        id: validCouncilId,
        name: 'Updated Council',
        description: 'Updated description',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCouncilRepository.getTrustScore.mockResolvedValue(20);
      mockCouncilRepository.getMemberCount.mockResolvedValue(6);

      const result = await councilService.updateCouncil(
        validCouncilId,
        { name: 'Updated Council', description: 'Updated description' },
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Council');
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_update'
      );
    });

    it('should reject user without can_update permission from updating council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(false); // No permission

      await expect(
        councilService.updateCouncil(validCouncilId, { name: 'Updated' }, validUserId)
      ).rejects.toThrow('Forbidden');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_update'
      );
    });
  });

  describe('deleteCouncil', () => {
    it('should allow user with can_delete permission to delete council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(true); // Has permission
      mockCouncilRepository.delete.mockResolvedValue(undefined);

      const result = await councilService.deleteCouncil(validCouncilId, validUserId);

      expect(result.success).toBe(true);
      expect(mockCouncilRepository.delete).toHaveBeenCalledWith(validCouncilId);
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_delete'
      );
    });

    it('should reject user without can_delete permission from deleting council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(false); // No permission

      await expect(councilService.deleteCouncil(validCouncilId, validUserId)).rejects.toThrow(
        'Forbidden'
      );

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_delete'
      );
    });
  });

  describe('Trust Management', () => {
    it('should allow member to award trust to council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCouncilRepository.hasAwardedTrust.mockResolvedValue(false);
      mockCouncilRepository.awardTrust.mockResolvedValue(undefined);
      mockCouncilRepository.getTrustScore.mockResolvedValue(16);

      const result = await councilService.awardTrust(validCouncilId, validUserId);

      expect(result).toBeDefined();
      expect(result.trustScore).toBe(16);
      expect(result.userHasTrusted).toBe(true);
    });

    it('should reject non-member from awarding trust', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(councilService.awardTrust(validCouncilId, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });

    it('should allow member to remove trust from council', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCouncilRepository.hasAwardedTrust.mockResolvedValue(true);
      mockCouncilRepository.removeTrust.mockResolvedValue(undefined);
      mockCouncilRepository.getTrustScore.mockResolvedValue(14);

      const result = await councilService.removeTrust(validCouncilId, validUserId);

      expect(result).toBeDefined();
      expect(result.trustScore).toBe(14);
      expect(result.userHasTrusted).toBe(false);
    });

    it('should get council trust status', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCouncilRepository.hasAwardedTrust.mockResolvedValue(true);
      mockCouncilRepository.getTrustScore.mockResolvedValue(15);

      const result = await councilService.getTrustStatus(validCouncilId, validUserId);

      expect(result).toBeDefined();
      expect(result.trustScore).toBe(15);
      expect(result.userHasTrusted).toBe(true);
    });
  });

  describe('Manager Management', () => {
    const targetUserId = '550e8400-e29b-41d4-a716-446655440004';

    it('should allow user with can_update permission to add manager', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(true); // Has permission
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCouncilRepository.isManager.mockResolvedValue(false);
      mockCouncilRepository.addManager.mockResolvedValue(undefined);
      mockCouncilRepository.getManagers.mockResolvedValue([]);

      const result = await councilService.addManager(validCouncilId, targetUserId, validUserId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_update'
      );
    });

    it('should reject user without can_update permission from adding manager', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(false); // No permission

      await expect(
        councilService.addManager(validCouncilId, targetUserId, validUserId)
      ).rejects.toThrow('Forbidden');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_update'
      );
    });

    it('should allow user with can_delete permission to remove manager', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(true); // Has permission
      mockCouncilRepository.isManager.mockResolvedValue(true);
      mockCouncilRepository.removeManager.mockResolvedValue(undefined);

      const result = await councilService.removeManager(validCouncilId, targetUserId, validUserId);

      expect(result.success).toBe(true);
      expect(mockCouncilRepository.removeManager).toHaveBeenCalled();
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_delete'
      );
    });

    it('should reject user without can_delete permission from removing manager', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        id: validCouncilId,
        name: 'Food Council',
        communityId: validCommunityId,
        createdBy: validUserId,
        createdAt: new Date(),
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(false); // No permission

      await expect(
        councilService.removeManager(validCouncilId, targetUserId, validUserId)
      ).rejects.toThrow('Forbidden');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        validUserId,
        'council',
        validCouncilId,
        'can_delete'
      );
    });
  });
});
