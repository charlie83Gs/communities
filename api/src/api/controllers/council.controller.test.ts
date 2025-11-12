import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { councilController } from './council.controller';
import { councilService } from '@/services/council.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockCouncilService = {
  listCouncils: mock(() => Promise.resolve([] as any[])),
  getCouncil: mock(() => Promise.resolve({ id: 'council-123', name: 'Food Council' })),
  createCouncil: mock(() => Promise.resolve({ id: 'council-123', name: 'Food Council' })),
  updateCouncil: mock(() => Promise.resolve({ id: 'council-123', name: 'Updated Council' })),
  deleteCouncil: mock(() => Promise.resolve()),
  awardTrust: mock(() => Promise.resolve({ success: true })),
  removeTrust: mock(() => Promise.resolve({ success: true })),
  getTrustStatus: mock(() => Promise.resolve({ trustScore: 15, userHasTrusted: true })),
  addManager: mock(() => Promise.resolve({ success: true })),
  removeManager: mock(() => Promise.resolve({ success: true })),
  getInventory: mock(() => Promise.resolve([] as any[])),
  getTransactions: mock(() => Promise.resolve({ transactions: [] as any[], total: 0 })),
};

describe('CouncilController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockCouncilService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockCouncilService).forEach(key => {
      (councilService as any)[key] = (mockCouncilService as any)[key];
    });
  });

  describe('list', () => {
    test('should list councils successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const councils = [{ id: 'council-123', name: 'Food Council' }] as any[];
      mockCouncilService.listCouncils.mockResolvedValue(councils);

      await councilController.list(req, res, next);

      expect(mockCouncilService.listCouncils).toHaveBeenCalledWith('comm-123', 'user-123', {
        page: 1,
        limit: 20,
        sortBy: undefined,
        order: undefined,
      });
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.listCouncils.mockRejectedValue(error);

      await councilController.list(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    test('should get council by ID successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const council = { id: 'council-123', name: 'Food Council' };
      mockCouncilService.getCouncil.mockResolvedValue(council);

      await councilController.getById(req, res, next);

      expect(mockCouncilService.getCouncil).toHaveBeenCalledWith('council-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockCouncilService.getCouncil.mockRejectedValue(error);

      await councilController.getById(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    test('should create council successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { name: 'Food Council', description: 'Manages food resources' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const council = { id: 'council-123', name: 'Food Council' };
      mockCouncilService.createCouncil.mockResolvedValue(council);

      await councilController.create(req, res, next);

      expect(mockCouncilService.createCouncil).toHaveBeenCalledWith(
        {
          communityId: 'comm-123',
          name: 'Food Council',
          description: 'Manages food resources',
          createdBy: 'user-123',
        },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { name: 'Food Council' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.createCouncil.mockRejectedValue(error);

      await councilController.create(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('should update council successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        body: { name: 'Updated Council' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const council = { id: 'council-123', name: 'Updated Council' };
      mockCouncilService.updateCouncil.mockResolvedValue(council);

      await councilController.update(req, res, next);

      expect(mockCouncilService.updateCouncil).toHaveBeenCalledWith('council-123', { name: 'Updated Council' }, 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.updateCouncil.mockRejectedValue(error);

      await councilController.update(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    test('should delete council successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCouncilService.deleteCouncil.mockResolvedValue(undefined);

      await councilController.delete(req, res, next);

      expect(mockCouncilService.deleteCouncil).toHaveBeenCalledWith('council-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.deleteCouncil.mockRejectedValue(error);

      await councilController.delete(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('awardTrust', () => {
    test('should award trust successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCouncilService.awardTrust.mockResolvedValue({ success: true });

      await councilController.awardTrust(req, res, next);

      expect(mockCouncilService.awardTrust).toHaveBeenCalledWith('council-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.awardTrust.mockRejectedValue(error);

      await councilController.awardTrust(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('removeTrust', () => {
    test('should remove trust successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCouncilService.removeTrust.mockResolvedValue({ success: true });

      await councilController.removeTrust(req, res, next);

      expect(mockCouncilService.removeTrust).toHaveBeenCalledWith('council-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.removeTrust.mockRejectedValue(error);

      await councilController.removeTrust(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getTrustStatus', () => {
    test('should get trust status successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const status = { trustScore: 15, userHasTrusted: true };
      mockCouncilService.getTrustStatus.mockResolvedValue(status);

      await councilController.getTrustStatus(req, res, next);

      expect(mockCouncilService.getTrustStatus).toHaveBeenCalledWith('council-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockCouncilService.getTrustStatus.mockRejectedValue(error);

      await councilController.getTrustStatus(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('addManager', () => {
    test('should add manager successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        body: { userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCouncilService.addManager.mockResolvedValue({ success: true });

      await councilController.addManager(req, res, next);

      expect(mockCouncilService.addManager).toHaveBeenCalledWith('council-123', 'user-456', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        body: { userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.addManager.mockRejectedValue(error);

      await councilController.addManager(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('removeManager', () => {
    test('should remove manager successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCouncilService.removeManager.mockResolvedValue({ success: true });

      await councilController.removeManager(req, res, next);

      expect(mockCouncilService.removeManager).toHaveBeenCalledWith('council-123', 'user-456', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.removeManager.mockRejectedValue(error);

      await councilController.removeManager(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getInventory', () => {
    test('should get inventory successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const inventory = [{ itemId: 'item-123', quantity: 5 }] as any[];
      mockCouncilService.getInventory.mockResolvedValue(inventory);

      await councilController.getInventory(req, res, next);

      expect(mockCouncilService.getInventory).toHaveBeenCalledWith('council-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.getInventory.mockRejectedValue(error);

      await councilController.getInventory(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getTransactions', () => {
    test('should get transactions successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        query: { page: '1', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { transactions: [], total: 0 };
      mockCouncilService.getTransactions.mockResolvedValue(result);

      await councilController.getTransactions(req, res, next);

      expect(mockCouncilService.getTransactions).toHaveBeenCalledWith('council-123', 'user-123', {
        page: 1,
        limit: 20,
      });
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockCouncilService.getTransactions.mockRejectedValue(error);

      await councilController.getTransactions(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
