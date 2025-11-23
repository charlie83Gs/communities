import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { wealthCommentService } from '@/services/wealthComment.service';
import { wealthCommentRepository } from '@/repositories/wealthComment.repository';
import { wealthRepository } from '@/repositories/wealth.repository';
import { openFGAService } from './openfga.service';

import { testData } from '../../tests/helpers/testUtils';

const mockWealthCommentRepository = {
  create: mock(() =>
    Promise.resolve({
      id: 'comment-123',
      wealthId: 'wealth-123',
      authorId: 'user-123',
      content: 'Test comment',
      createdAt: new Date(),
    })
  ),
  findById: mock(() => Promise.resolve(null)),
  findByWealthId: mock(() => Promise.resolve([])),
  update: mock(() =>
    Promise.resolve({
      id: 'comment-123',
      wealthId: 'wealth-123',
      authorId: 'user-123',
      content: 'Updated comment',
      createdAt: new Date(),
    })
  ),
  delete: mock(() => Promise.resolve({ id: 'comment-123' })),
};

const mockWealthRepository = {
  findById: mock(() => Promise.resolve(testData.wealth)),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
  assignRelation: mock(() => Promise.resolve()),
};

describe('WealthCommentService', () => {
  beforeEach(() => {
    Object.values(mockWealthCommentRepository).forEach((m) => m.mockReset());
    Object.values(mockWealthRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    (wealthCommentRepository.create as any) = mockWealthCommentRepository.create;
    (wealthCommentRepository.findById as any) = mockWealthCommentRepository.findById;
    (wealthCommentRepository.findByWealthId as any) = mockWealthCommentRepository.findByWealthId;
    (wealthCommentRepository.update as any) = mockWealthCommentRepository.update;
    (wealthCommentRepository.delete as any) = mockWealthCommentRepository.delete;
    (wealthRepository.findById as any) = mockWealthRepository.findById;
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
    (openFGAService.assignRelation as any) = mockOpenFGAService.assignRelation;
  });

  describe('createComment', () => {
    it('should create comment when user has permission', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockWealthCommentRepository.create.mockResolvedValue({
        id: 'comment-123',
        wealthId: 'wealth-123',
        authorId: 'user-123',
        content: 'Test comment',
        createdAt: new Date(),
      });
      mockOpenFGAService.assignRelation.mockResolvedValue(undefined);

      const result = await wealthCommentService.createComment(
        { wealthId: 'wealth-123', content: 'Test', authorId: 'user-123' } as any,
        'user-123'
      );

      expect(result.id).toBe('comment-123');
      expect(mockWealthCommentRepository.create).toHaveBeenCalledWith({
        wealthId: 'wealth-123',
        content: 'Test',
        authorId: 'user-123',
      });
      expect(mockOpenFGAService.assignRelation).toHaveBeenCalled();
    });

    it('should throw error if wealth not found', async () => {
      mockWealthRepository.findById.mockResolvedValue(null as any);

      await expect(
        wealthCommentService.createComment(
          { wealthId: 'wealth-123', content: 'Test', authorId: 'user-123' } as any,
          'user-123'
        )
      ).rejects.toThrow('Wealth not found');
    });

    it('should throw forbidden if user lacks permission', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        wealthCommentService.createComment(
          { wealthId: 'wealth-123', content: 'Test', authorId: 'user-123' } as any,
          'user-123'
        )
      ).rejects.toThrow('Forbidden: You do not have permission to comment on this wealth');
    });
  });

  describe('getCommentsByWealthId', () => {
    it('should return comments when user has permission', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockWealthCommentRepository.findByWealthId.mockResolvedValue([
        { id: 'comment-123', content: 'Test comment' } as any,
      ] as any);

      const result = await wealthCommentService.getCommentsByWealthId('wealth-123', 'user-123');

      expect(result).toHaveLength(1);
    });

    it('should throw error if wealth not found', async () => {
      mockWealthRepository.findById.mockResolvedValue(null as any);

      await expect(
        wealthCommentService.getCommentsByWealthId('wealth-123', 'user-123')
      ).rejects.toThrow('Wealth not found');
    });

    it('should throw forbidden if user lacks permission', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        wealthCommentService.getCommentsByWealthId('wealth-123', 'user-123')
      ).rejects.toThrow('Forbidden: You do not have permission to view comments on this wealth');
    });
  });

  describe('updateComment', () => {
    it('should update comment when user is author', async () => {
      mockWealthCommentRepository.findById.mockResolvedValue({
        id: 'comment-123',
        authorId: 'user-123',
        content: 'Original',
      } as any);
      mockWealthCommentRepository.update.mockResolvedValue({
        id: 'comment-123',
        wealthId: 'wealth-123',
        authorId: 'user-123',
        content: 'Updated comment',
        createdAt: new Date(),
      } as any);

      const result = await wealthCommentService.updateComment(
        'comment-123',
        { content: 'Updated' },
        'user-123'
      );

      expect(result.content).toBe('Updated comment');
      expect(mockWealthCommentRepository.update).toHaveBeenCalled();
    });

    it('should throw error if comment not found', async () => {
      mockWealthCommentRepository.findById.mockResolvedValue(null as any);

      await expect(
        wealthCommentService.updateComment('comment-123', { content: 'Updated' }, 'user-123')
      ).rejects.toThrow('Comment not found');
    });

    it('should throw forbidden if user is not author', async () => {
      mockWealthCommentRepository.findById.mockResolvedValue({
        id: 'comment-123',
        authorId: 'user-456',
        content: 'Original',
      } as any);

      await expect(
        wealthCommentService.updateComment('comment-123', { content: 'Updated' }, 'user-123')
      ).rejects.toThrow('Forbidden: You can only update your own comments');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment when user is author', async () => {
      mockWealthCommentRepository.findById.mockResolvedValue({
        id: 'comment-123',
        authorId: 'user-123',
      } as any);

      // @ts-ignore
      const _result = await wealthCommentService.deleteComment('comment-123', 'user-123');

      expect(mockWealthCommentRepository.delete).toHaveBeenCalledWith('comment-123');
    });

    it('should throw error if comment not found', async () => {
      mockWealthCommentRepository.findById.mockResolvedValue(null as any);

      await expect(wealthCommentService.deleteComment('comment-123', 'user-123')).rejects.toThrow(
        'Comment not found'
      );
    });

    it('should throw forbidden if user is not author', async () => {
      mockWealthCommentRepository.findById.mockResolvedValue({
        id: 'comment-123',
        authorId: 'user-456',
      } as any);

      await expect(wealthCommentService.deleteComment('comment-123', 'user-123')).rejects.toThrow(
        'Forbidden: You can only delete your own comments'
      );
    });
  });
});
