import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { trustSyncService } from '@/services/trustSync.service';
import { openFGAService } from './openfga.service';
import { trustViewRepository } from '@/repositories/trustView.repository';

const mockOpenFGAService = {
  batchWrite: mock(() => Promise.resolve()),
  check: mock(() => Promise.resolve(false)),
  readTuples: mock(async () => []),
};

const mockTrustViewRepository = {
  getAllForCommunity: mock(() =>
    Promise.resolve([
      { communityId: 'comm-123', userId: 'user-123', points: 25 },
      { communityId: 'comm-123', userId: 'user-456', points: 50 },
    ])
  ),
};

describe('TrustSyncService', () => {
  beforeEach(() => {
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());
    Object.values(mockTrustViewRepository).forEach((m) => m.mockReset());

    (openFGAService.batchWrite as any) = mockOpenFGAService.batchWrite;
    (openFGAService.check as any) = mockOpenFGAService.check;
    (openFGAService.readTuples as any) = mockOpenFGAService.readTuples;
    (trustViewRepository.getAllForCommunity as any) = mockTrustViewRepository.getAllForCommunity;
  });

  describe('syncUserTrustScore', () => {
    it('should sync new trust score', async () => {
      // Reconfigure mocks for this test
      mockOpenFGAService.batchWrite.mockResolvedValue(undefined);

      await trustSyncService.syncUserTrustScore('comm-123', 'user-123', 25);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        [
          {
            user: 'user:user-123',
            relation: 'trust_level_25',
            object: 'community:comm-123',
          },
        ],
        []
      );
    });

    it('should remove old trust level when updating', async () => {
      await trustSyncService.syncUserTrustScore('comm-123', 'user-123', 30, 20);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        [
          {
            user: 'user:user-123',
            relation: 'trust_level_30',
            object: 'community:comm-123',
          },
        ],
        [
          {
            user: 'user:user-123',
            relation: 'trust_level_20',
            object: 'community:comm-123',
          },
        ]
      );
    });

    it('should clamp trust score to 0-100 range', async () => {
      await trustSyncService.syncUserTrustScore('comm-123', 'user-123', 150);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        [
          {
            user: 'user:user-123',
            relation: 'trust_level_100',
            object: 'community:comm-123',
          },
        ],
        []
      );
    });

    it('should handle negative trust scores', async () => {
      await trustSyncService.syncUserTrustScore('comm-123', 'user-123', -10);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        [
          {
            user: 'user:user-123',
            relation: 'trust_level_0',
            object: 'community:comm-123',
          },
        ],
        []
      );
    });

    it('should not delete when old and new scores are equal', async () => {
      await trustSyncService.syncUserTrustScore('comm-123', 'user-123', 25, 25);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        [
          {
            user: 'user:user-123',
            relation: 'trust_level_25',
            object: 'community:comm-123',
          },
        ],
        []
      );
    });
  });

  describe('syncCommunityTrustScores', () => {
    it('should sync all trust scores for a community', async () => {
      // Reconfigure mocks for this test
      mockTrustViewRepository.getAllForCommunity.mockResolvedValue([
        { communityId: 'comm-123', userId: 'user-123', points: 25 },
        { communityId: 'comm-123', userId: 'user-456', points: 50 },
      ]);
      // Mock readTuples to return proper tuple structure
      mockOpenFGAService.readTuples.mockResolvedValue([
        {
          key: {
            user: 'user:user-123',
            relation: 'trust_level_20',
            object: 'community:comm-123',
          },
        } as any,
      ] as any);
      mockOpenFGAService.batchWrite.mockResolvedValue(undefined);

      await trustSyncService.syncCommunityTrustScores('comm-123');

      expect(mockTrustViewRepository.getAllForCommunity).toHaveBeenCalledWith('comm-123');
      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledTimes(2); // Once for clear, once for write
    });

    it('should handle empty community', async () => {
      mockTrustViewRepository.getAllForCommunity.mockResolvedValue([]);

      await trustSyncService.syncCommunityTrustScores('comm-123');

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalled();
    });
  });

  describe('hasSufficientTrust', () => {
    it('should return true when user has exact required level', async () => {
      mockOpenFGAService.check.mockResolvedValueOnce(true);

      const result = await trustSyncService.hasSufficientTrust('comm-123', 'user-123', 20);

      expect(result).toBe(true);
      expect(mockOpenFGAService.check).toHaveBeenCalledWith({
        user: 'user:user-123',
        relation: 'trust_level_20',
        object: 'community:comm-123',
      });
    });

    it('should return true when user has higher level', async () => {
      // First check at level 15 fails, then at level 16 succeeds
      mockOpenFGAService.check.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      const result = await trustSyncService.hasSufficientTrust('comm-123', 'user-123', 15);

      expect(result).toBe(true);
    });

    it('should return false when user lacks trust level', async () => {
      mockOpenFGAService.check.mockResolvedValue(false);

      const result = await trustSyncService.hasSufficientTrust('comm-123', 'user-123', 20);

      expect(result).toBe(false);
    });

    it('should clamp required level to 0-100', async () => {
      mockOpenFGAService.check.mockResolvedValue(false);

      await trustSyncService.hasSufficientTrust('comm-123', 'user-123', 150);

      expect(mockOpenFGAService.check).toHaveBeenCalledWith({
        user: 'user:user-123',
        relation: 'trust_level_100',
        object: 'community:comm-123',
      });
    });
  });

  describe('getUserTrustLevel', () => {
    it('should return highest trust level', async () => {
      // Mock checks: level 100 fails, 99 fails, ..., 50 succeeds
      mockOpenFGAService.check.mockImplementation((async ({ relation }: any) => {
        const level = parseInt(relation.replace('trust_level_', ''));
        return level === 50;
      }) as any);

      const result = await trustSyncService.getUserTrustLevel('comm-123', 'user-123');

      expect(result).toBe(50);
    });

    it('should return null if no trust level found', async () => {
      mockOpenFGAService.check.mockResolvedValue(false);

      const result = await trustSyncService.getUserTrustLevel('comm-123', 'user-123');

      expect(result).toBeNull();
    });

    it('should return 0 if user has level 0', async () => {
      mockOpenFGAService.check.mockImplementation((async ({ relation }: any) => {
        const level = parseInt(relation.replace('trust_level_', ''));
        return level === 0;
      }) as any);

      const result = await trustSyncService.getUserTrustLevel('comm-123', 'user-123');

      expect(result).toBe(0);
    });
  });

  describe('syncCouncilTrustScore', () => {
    it('should sync council trust score rounded to nearest 5', async () => {
      await trustSyncService.syncCouncilTrustScore('comm-123', 'council-123', 43);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            user: 'council:council-123',
            relation: 'trust_level_45',
            object: 'community:comm-123',
          },
        ]),
        []
      );
    });

    it('should remove old council trust level', async () => {
      await trustSyncService.syncCouncilTrustScore('comm-123', 'council-123', 55, 40);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            user: 'council:council-123',
            relation: 'trust_level_55',
            object: 'community:comm-123',
          },
        ]),
        [
          {
            user: 'council:council-123',
            relation: 'trust_level_40',
            object: 'community:comm-123',
          },
        ]
      );
    });

    it('should assign trust to both community and council object', async () => {
      await trustSyncService.syncCouncilTrustScore('comm-123', 'council-123', 50);

      expect(mockOpenFGAService.batchWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            user: 'council:council-123',
            relation: 'trust_level_50',
            object: 'community:comm-123',
          },
          {
            user: 'council:council-123',
            relation: 'trust_level_50',
            object: 'council:council-123',
          },
        ]),
        []
      );
    });
  });
});
