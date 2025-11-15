import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { valueRecognitionService } from '../valueRecognition.service';
import { recognizedContributionRepository } from '../../repositories/recognizedContribution.repository';
import { contributionSummaryRepository } from '../../repositories/contributionSummary.repository';
import { peerRecognitionGrantRepository } from '../../repositories/peerRecognitionGrant.repository';
import { itemsRepository } from '../../repositories/items.repository';
import { communityRepository } from '../../repositories/community.repository';
import { openFGAService } from '../openfga.service';
import { AppError } from '../../utils/errors';

// Mock data
const mockItem = {
  id: 'item-123',
  communityId: 'community-123',
  translations: {
    en: {
      name: 'Childcare',
      description: 'Childcare services',
    },
  },
  kind: 'service' as const,
  wealthValue: '10',
  isDefault: false,
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  contributionMetadata: null,
};

const mockContribution = {
  id: 'contribution-123',
  communityId: 'community-123',
  contributorId: 'user-123',
  itemId: 'item-123',
  units: '3',
  valuePerUnit: '10',
  totalValue: '30',
  description: 'Provided childcare',
  verificationStatus: 'pending' as const,
  verifiedBy: null,
  verifiedAt: null,
  beneficiaryIds: ['user-456'],
  witnessIds: [],
  testimonial: null,
  sourceType: 'self_reported' as const,
  sourceId: null,
  createdAt: new Date(),
  deletedAt: null,
};

const mockCommunity = {
  id: 'community-123',
  name: 'Test Community',
  description: 'Test',
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  valueRecognitionSettings: {
    enabled: true,
    peer_grant_monthly_limit: 20,
    peer_grant_same_person_limit: 3,
  },
};

describe('ValueRecognitionService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mock.restore();
  });

  describe('logContribution', () => {
    it('should log a self-reported contribution with pending status', async () => {
      // Mock OpenFGA permission check
      const checkAccessMock = mock(() => Promise.resolve(true));
      (openFGAService.checkAccess as any) = checkAccessMock;

      // Mock repository methods
      const findByIdMock = mock(() => Promise.resolve(mockItem));
      const createMock = mock(() => Promise.resolve(mockContribution));

      (itemsRepository.findById as any) = findByIdMock;
      (recognizedContributionRepository.create as any) = createMock;

      const result = await valueRecognitionService.logContribution({
        communityId: 'community-123',
        contributorId: 'user-123',
        itemId: 'item-123',
        units: 3,
        description: 'Provided childcare',
        beneficiaryIds: ['user-456'],
        sourceType: 'self_reported',
      });

      expect(checkAccessMock).toHaveBeenCalledWith('user-123', 'community', 'community-123', 'can_log_contributions');
      expect(findByIdMock).toHaveBeenCalledWith('item-123');
      expect(createMock).toHaveBeenCalled();
      expect(result).toEqual(mockContribution);
    });

    it('should auto-verify system-logged contributions', async () => {
      const autoVerifiedContribution = {
        ...mockContribution,
        verificationStatus: 'auto_verified' as const,
      };

      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockItem));
      const createMock = mock(() => Promise.resolve(autoVerifiedContribution));
      const updateSummaryMock = mock(() => Promise.resolve());

      (openFGAService.checkAccess as any) = checkAccessMock;
      (itemsRepository.findById as any) = findByIdMock;
      (recognizedContributionRepository.create as any) = createMock;
      (valueRecognitionService as any).updateContributionSummary = updateSummaryMock;

      const result = await valueRecognitionService.logContribution({
        communityId: 'community-123',
        contributorId: 'user-123',
        itemId: 'item-123',
        units: 3,
        description: 'System tracked',
        sourceType: 'system_logged',
      });

      expect(result.verificationStatus).toBe('auto_verified');
      expect(updateSummaryMock).toHaveBeenCalled();
    });

    it('should throw error if user lacks permission', async () => {
      const checkAccessMock = mock(() => Promise.resolve(false));
      (openFGAService.checkAccess as any) = checkAccessMock;

      await expect(
        valueRecognitionService.logContribution({
          communityId: 'community-123',
          contributorId: 'user-123',
          itemId: 'item-123',
          units: 3,
          description: 'Test',
          sourceType: 'self_reported',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if item not found', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(null));

      (openFGAService.checkAccess as any) = checkAccessMock;
      (itemsRepository.findById as any) = findByIdMock;

      await expect(
        valueRecognitionService.logContribution({
          communityId: 'community-123',
          contributorId: 'user-123',
          itemId: 'invalid-item',
          units: 3,
          description: 'Test',
          sourceType: 'self_reported',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if item belongs to different community', async () => {
      const wrongCommunityItem = { ...mockItem, communityId: 'different-community' };
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(wrongCommunityItem));

      (openFGAService.checkAccess as any) = checkAccessMock;
      (itemsRepository.findById as any) = findByIdMock;

      await expect(
        valueRecognitionService.logContribution({
          communityId: 'community-123',
          contributorId: 'user-123',
          itemId: 'item-123',
          units: 3,
          description: 'Test',
          sourceType: 'self_reported',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('verifyContribution', () => {
    it('should verify contribution when user is beneficiary', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockContribution));
      const updateMock = mock(() =>
        Promise.resolve({ ...mockContribution, verificationStatus: 'verified' as const })
      );
      const updateSummaryMock = mock(() => Promise.resolve());

      (openFGAService.checkAccess as any) = checkAccessMock;
      (recognizedContributionRepository.findById as any) = findByIdMock;
      (recognizedContributionRepository.update as any) = updateMock;
      (valueRecognitionService as any).updateContributionSummary = updateSummaryMock;

      const result = await valueRecognitionService.verifyContribution({
        contributionId: 'contribution-123',
        userId: 'user-456', // Beneficiary
        testimonial: 'Great work!',
      });

      expect(checkAccessMock).toHaveBeenCalledWith('user-456', 'community', 'community-123', 'can_verify_contributions');
      expect(updateMock).toHaveBeenCalled();
      expect(updateSummaryMock).toHaveBeenCalled();
    });

    it('should throw error if user lacks permission', async () => {
      const checkAccessMock = mock(() => Promise.resolve(false));
      const findByIdMock = mock(() => Promise.resolve(mockContribution));

      (openFGAService.checkAccess as any) = checkAccessMock;
      (recognizedContributionRepository.findById as any) = findByIdMock;

      await expect(
        valueRecognitionService.verifyContribution({
          contributionId: 'contribution-123',
          userId: 'user-456',
          testimonial: 'Test',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if user is not beneficiary or witness', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockContribution));

      (openFGAService.checkAccess as any) = checkAccessMock;
      (recognizedContributionRepository.findById as any) = findByIdMock;

      await expect(
        valueRecognitionService.verifyContribution({
          contributionId: 'contribution-123',
          userId: 'unauthorized-user',
          testimonial: 'Test',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('grantPeerRecognition', () => {
    it('should grant peer recognition within limits', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockCommunity));
      const getMonthlyTotalMock = mock(() =>
        Promise.resolve({ totalGranted: '5', grantCount: 2 })
      );
      const getGrantsToSamePersonMock = mock(() => Promise.resolve([]));
      const createGrantMock = mock(() =>
        Promise.resolve({ id: 'grant-123', ...mockCommunity })
      );
      const createContributionMock = mock(() => Promise.resolve(mockContribution));
      const updateSummaryMock = mock(() => Promise.resolve());

      (openFGAService.checkAccess as any) = checkAccessMock;
      (communityRepository.findById as any) = findByIdMock;
      (peerRecognitionGrantRepository.getMonthlyTotalByFromUser as any) = getMonthlyTotalMock;
      (peerRecognitionGrantRepository.getGrantsToSamePersonInMonth as any) =
        getGrantsToSamePersonMock;
      (peerRecognitionGrantRepository.create as any) = createGrantMock;
      (recognizedContributionRepository.create as any) = createContributionMock;
      (valueRecognitionService as any).updateContributionSummary = updateSummaryMock;

      const result = await valueRecognitionService.grantPeerRecognition({
        communityId: 'community-123',
        fromUserId: 'user-123',
        toUserId: 'user-456',
        valueUnits: 10,
        description: 'Great help!',
      });

      expect(checkAccessMock).toHaveBeenCalledWith('user-123', 'community', 'community-123', 'can_grant_peer_recognition');
      expect(createGrantMock).toHaveBeenCalled();
      expect(createContributionMock).toHaveBeenCalled();
      expect(updateSummaryMock).toHaveBeenCalled();
    });

    it('should throw error if user lacks permission', async () => {
      const checkAccessMock = mock(() => Promise.resolve(false));
      (openFGAService.checkAccess as any) = checkAccessMock;

      await expect(
        valueRecognitionService.grantPeerRecognition({
          communityId: 'community-123',
          fromUserId: 'user-123',
          toUserId: 'user-456',
          valueUnits: 10,
          description: 'Test',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error when granting to self', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockCommunity));

      (openFGAService.checkAccess as any) = checkAccessMock;
      (communityRepository.findById as any) = findByIdMock;

      await expect(
        valueRecognitionService.grantPeerRecognition({
          communityId: 'community-123',
          fromUserId: 'user-123',
          toUserId: 'user-123', // Same user
          valueUnits: 10,
          description: 'Test',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error when monthly limit exceeded', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockCommunity));
      const getMonthlyTotalMock = mock(() =>
        Promise.resolve({ totalGranted: '19', grantCount: 5 })
      );

      (openFGAService.checkAccess as any) = checkAccessMock;
      (communityRepository.findById as any) = findByIdMock;
      (peerRecognitionGrantRepository.getMonthlyTotalByFromUser as any) = getMonthlyTotalMock;

      await expect(
        valueRecognitionService.grantPeerRecognition({
          communityId: 'community-123',
          fromUserId: 'user-123',
          toUserId: 'user-456',
          valueUnits: 10, // Would exceed limit of 20
          description: 'Test',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error when same-person limit exceeded', async () => {
      const checkAccessMock = mock(() => Promise.resolve(true));
      const findByIdMock = mock(() => Promise.resolve(mockCommunity));
      const getMonthlyTotalMock = mock(() =>
        Promise.resolve({ totalGranted: '5', grantCount: 2 })
      );
      const getGrantsToSamePersonMock = mock(() =>
        Promise.resolve([{}, {}, {}]) // 3 grants already
      );

      (openFGAService.checkAccess as any) = checkAccessMock;
      (communityRepository.findById as any) = findByIdMock;
      (peerRecognitionGrantRepository.getMonthlyTotalByFromUser as any) = getMonthlyTotalMock;
      (peerRecognitionGrantRepository.getGrantsToSamePersonInMonth as any) =
        getGrantsToSamePersonMock;

      await expect(
        valueRecognitionService.grantPeerRecognition({
          communityId: 'community-123',
          fromUserId: 'user-123',
          toUserId: 'user-456',
          valueUnits: 5,
          description: 'Test',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('checkPeerRecognitionLimits', () => {
    it('should return remaining limits', async () => {
      const findByIdMock = mock(() => Promise.resolve(mockCommunity));
      const getMonthlyTotalMock = mock(() =>
        Promise.resolve({ totalGranted: '12', grantCount: 3 })
      );

      (communityRepository.findById as any) = findByIdMock;
      (peerRecognitionGrantRepository.getMonthlyTotalByFromUser as any) = getMonthlyTotalMock;

      const result = await valueRecognitionService.checkPeerRecognitionLimits(
        'user-123',
        'community-123'
      );

      expect(result.monthlyLimit).toBe(20);
      expect(result.used).toBe(12);
      expect(result.remaining).toBe(8);
    });
  });
});
