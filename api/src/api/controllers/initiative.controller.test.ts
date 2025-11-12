import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { initiativeController } from './initiative.controller';
import { initiativeService } from '@/services/initiative.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockInitiativeService = {
  createInitiative: mock(() => Promise.resolve({ id: 'init-123', title: 'Community Garden' })),
  listInitiatives: mock(() => Promise.resolve({ initiatives: [] as any[], total: 0 })),
  getInitiative: mock(() => Promise.resolve({ id: 'init-123', title: 'Community Garden' })),
  updateInitiative: mock(() => Promise.resolve({ id: 'init-123', title: 'Updated Initiative' })),
  deleteInitiative: mock(() => Promise.resolve()),
  voteOnInitiative: mock(() => Promise.resolve({ success: true })),
  removeVote: mock(() => Promise.resolve({ success: true })),
  createReport: mock(() => Promise.resolve({ id: 'report-123' })),
  listReports: mock(() => Promise.resolve([] as any[])),
  createComment: mock(() => Promise.resolve({ id: 'comment-123' })),
  listComments: mock(() => Promise.resolve([] as any[])),
  createReportComment: mock(() => Promise.resolve({ id: 'comment-123' })),
  listReportComments: mock(() => Promise.resolve([] as any[])),
};

describe('InitiativeController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockInitiativeService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockInitiativeService).forEach(key => {
      (initiativeService as any)[key] = (mockInitiativeService as any)[key];
    });
  });

  describe('create', () => {
    test('should create initiative successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', councilId: 'council-123' },
        body: { title: 'Community Garden', description: 'Build a garden' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const initiative = { id: 'init-123', title: 'Community Garden' };
      mockInitiativeService.createInitiative.mockResolvedValue(initiative);

      await initiativeController.create(req, res, next);

      expect(mockInitiativeService.createInitiative).toHaveBeenCalledWith('council-123', {
        title: 'Community Garden',
        description: 'Build a garden',
      }, 'user-123');
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { title: 'Initiative' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.createInitiative.mockRejectedValue(error);

      await initiativeController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('list', () => {
    test('should list initiatives successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { page: '1', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { initiatives: [], total: 0 };
      mockInitiativeService.listInitiatives.mockResolvedValue(result);

      await initiativeController.list(req, res, next);

      expect(mockInitiativeService.listInitiatives).toHaveBeenCalled();
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
      mockInitiativeService.listInitiatives.mockRejectedValue(error);

      await initiativeController.list(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    test('should get initiative by ID successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const initiative = { id: 'init-123', title: 'Community Garden' };
      mockInitiativeService.getInitiative.mockResolvedValue(initiative);

      await initiativeController.getById(req, res, next);

      expect(mockInitiativeService.getInitiative).toHaveBeenCalledWith('init-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockInitiativeService.getInitiative.mockRejectedValue(error);

      await initiativeController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    test('should update initiative successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { title: 'Updated Initiative' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const initiative = { id: 'init-123', title: 'Updated Initiative' };
      mockInitiativeService.updateInitiative.mockResolvedValue(initiative);

      await initiativeController.update(req, res, next);

      expect(mockInitiativeService.updateInitiative).toHaveBeenCalledWith('init-123', {
        title: 'Updated Initiative',
      }, 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { title: 'Updated' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.updateInitiative.mockRejectedValue(error);

      await initiativeController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    test('should delete initiative successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInitiativeService.deleteInitiative.mockResolvedValue(undefined);

      await initiativeController.delete(req, res, next);

      expect(mockInitiativeService.deleteInitiative).toHaveBeenCalledWith('init-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.deleteInitiative.mockRejectedValue(error);

      await initiativeController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('vote', () => {
    test('should vote successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { voteType: 'upvote' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInitiativeService.voteOnInitiative.mockResolvedValue({ success: true });

      await initiativeController.vote(req, res, next);

      expect(mockInitiativeService.voteOnInitiative).toHaveBeenCalledWith('init-123', 'upvote', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { voteType: 'upvote' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.voteOnInitiative.mockRejectedValue(error);

      await initiativeController.vote(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeVote', () => {
    test('should remove vote successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInitiativeService.removeVote.mockResolvedValue({ success: true });

      await initiativeController.removeVote(req, res, next);

      expect(mockInitiativeService.removeVote).toHaveBeenCalledWith('init-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.removeVote.mockRejectedValue(error);

      await initiativeController.removeVote(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createReport', () => {
    test('should create report successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { title: 'Progress Report', content: 'Great progress!' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const report = { id: 'report-123' };
      mockInitiativeService.createReport.mockResolvedValue(report);

      await initiativeController.createReport(req, res, next);

      expect(mockInitiativeService.createReport).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { title: 'Report' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.createReport.mockRejectedValue(error);

      await initiativeController.createReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listReports', () => {
    test('should list reports successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const reports = [{ id: 'report-123' }] as any[];
      mockInitiativeService.listReports.mockResolvedValue(reports);

      await initiativeController.listReports(req, res, next);

      expect(mockInitiativeService.listReports).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.listReports.mockRejectedValue(error);

      await initiativeController.listReports(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createComment', () => {
    test('should create comment successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { content: 'Great initiative!' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const comment = { id: 'comment-123' };
      mockInitiativeService.createComment.mockResolvedValue(comment);

      await initiativeController.createComment(req, res, next);

      expect(mockInitiativeService.createComment).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
        body: { content: 'Comment' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.createComment.mockRejectedValue(error);

      await initiativeController.createComment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listComments', () => {
    test('should list comments successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const comments = [{ id: 'comment-123' }] as any[];
      mockInitiativeService.listComments.mockResolvedValue(comments);

      await initiativeController.listComments(req, res, next);

      expect(mockInitiativeService.listComments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', initiativeId: 'init-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInitiativeService.listComments.mockRejectedValue(error);

      await initiativeController.listComments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
