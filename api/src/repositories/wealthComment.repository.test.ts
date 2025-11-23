import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { WealthCommentRepository } from '@/repositories/wealthComment.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let wealthCommentRepository: WealthCommentRepository;

// Create mock database
const mockDb = createThenableMockDb();

const testComment = {
  id: 'comment-123',
  wealthId: 'wealth-123',
  authorId: 'user-123',
  content: 'This is a great resource!',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('WealthCommentRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    wealthCommentRepository = new WealthCommentRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh WealthCommentRepository is created per test
  });

  describe('create', () => {
    it('should create a wealth comment', async () => {
      mockDb.returning.mockResolvedValue([testComment]);

      const result = await wealthCommentRepository.create({
        wealthId: 'wealth-123',
        authorId: 'user-123',
        content: 'This is a great resource!',
      });

      expect(result).toEqual(testComment);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find comment by id', async () => {
      mockDb.where.mockResolvedValue([testComment]);

      const result = await wealthCommentRepository.findById('comment-123');

      expect(result).toEqual(testComment);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if comment not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await wealthCommentRepository.findById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByWealthId', () => {
    it('should find comments by wealth id', async () => {
      mockDb.offset.mockResolvedValue([testComment]);

      const result = await wealthCommentRepository.findByWealthId('wealth-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testComment);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should handle custom limit and offset', async () => {
      mockDb.offset.mockResolvedValue([testComment]);

      await wealthCommentRepository.findByWealthId('wealth-123', 10, 20);

      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should return empty array if no comments', async () => {
      mockDb.offset.mockResolvedValue([]);

      const result = await wealthCommentRepository.findByWealthId('wealth-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update comment', async () => {
      const updatedComment = {
        ...testComment,
        content: 'Updated content',
      };
      mockDb.returning.mockResolvedValue([updatedComment]);

      const result = await wealthCommentRepository.update('comment-123', {
        content: 'Updated content',
      });

      expect(result?.content).toBe('Updated content');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should return undefined if comment not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await wealthCommentRepository.update('nonexistent', {
        content: 'Updated content',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete comment', async () => {
      mockDb.returning.mockResolvedValue([testComment]);

      const result = await wealthCommentRepository.delete('comment-123');

      expect(result).toEqual(testComment);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should return undefined if comment not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await wealthCommentRepository.delete('nonexistent');

      expect(result).toBeUndefined();
    });
  });
});
