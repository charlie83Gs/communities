import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { trustLevelController } from './trustLevel.controller';
import { trustLevelService } from '@/services/trustLevel.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockTrustLevelService = {
  createTrustLevel: mock(() => Promise.resolve({ id: 'level-123', name: 'Trusted', threshold: 50 })),
  listTrustLevels: mock(() => Promise.resolve([])),
  getTrustLevel: mock(() => Promise.resolve({ id: 'level-123', name: 'Trusted', threshold: 50 })),
  updateTrustLevel: mock(() => Promise.resolve({ id: 'level-123', name: 'Updated', threshold: 60 })),
  deleteTrustLevel: mock(() => Promise.resolve()),
  resolveTrustReference: mock(() => Promise.resolve({ id: 'level-123', name: 'Trusted', threshold: 50 })),
};

describe('TrustLevelController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockTrustLevelService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockTrustLevelService).forEach(key => {
      (trustLevelService as any)[key] = (mockTrustLevelService as any)[key];
    });
  });

  describe('create', () => {
    test('should create trust level successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { name: 'Trusted', threshold: 50 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const trustLevel = { id: 'level-123', name: 'Trusted', threshold: 50 };
      mockTrustLevelService.createTrustLevel.mockResolvedValue(trustLevel);

      await trustLevelController.create(req, res, next);

      expect(mockTrustLevelService.createTrustLevel).toHaveBeenCalledWith('comm-123', {
        name: 'Trusted',
        threshold: 50,
      }, 'user-123');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { name: 'Trusted' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Validation error');
      mockTrustLevelService.createTrustLevel.mockRejectedValue(error);

      await trustLevelController.create(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    test('should list trust levels successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const levels = [{ id: 'level-123', name: 'Trusted', threshold: 50 }];
      mockTrustLevelService.listTrustLevels.mockResolvedValue(levels);

      await trustLevelController.list(req, res, next);

      expect(mockTrustLevelService.listTrustLevels).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustLevelService.listTrustLevels.mockRejectedValue(error);

      await trustLevelController.list(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    test('should get trust level by ID successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', levelId: 'level-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const level = { id: 'level-123', name: 'Trusted', threshold: 50 };
      mockTrustLevelService.getTrustLevel.mockResolvedValue(level);

      await trustLevelController.getById(req, res, next);

      expect(mockTrustLevelService.getTrustLevel).toHaveBeenCalledWith('level-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', levelId: 'level-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockTrustLevelService.getTrustLevel.mockRejectedValue(error);

      await trustLevelController.getById(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('should update trust level successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', levelId: 'level-123' },
        body: { name: 'Updated', threshold: 60 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const level = { id: 'level-123', name: 'Updated', threshold: 60 };
      mockTrustLevelService.updateTrustLevel.mockResolvedValue(level);

      await trustLevelController.update(req, res, next);

      expect(mockTrustLevelService.updateTrustLevel).toHaveBeenCalledWith('level-123', {
        name: 'Updated',
        threshold: 60,
      }, 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', levelId: 'level-123' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustLevelService.updateTrustLevel.mockRejectedValue(error);

      await trustLevelController.update(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    test('should delete trust level successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', levelId: 'level-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockTrustLevelService.deleteTrustLevel.mockResolvedValue(undefined);

      await trustLevelController.delete(req, res, next);

      expect(mockTrustLevelService.deleteTrustLevel).toHaveBeenCalledWith('level-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', levelId: 'level-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustLevelService.deleteTrustLevel.mockRejectedValue(error);

      await trustLevelController.delete(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('resolve', () => {
    test('should resolve trust level by reference successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', reference: 'Stable' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const level = { name: 'Stable', threshold: 10 };
      mockTrustLevelService.resolveTrustReference.mockResolvedValue(level);

      await trustLevelController.resolve(req, res, next);

      expect(mockTrustLevelService.resolveTrustReference).toHaveBeenCalledWith('comm-123', 'Stable', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', reference: 'Invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockTrustLevelService.resolveTrustReference.mockRejectedValue(error);

      await trustLevelController.resolve(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
