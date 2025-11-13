import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { InitiativeRepository } from '@/repositories/initiative.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let initiativeRepository: InitiativeRepository;

// Create mock database
const mockDb = createThenableMockDb();

const testInitiative = {
  id: 'initiative-123',
  councilId: 'council-123',
  communityId: 'comm-123',
  title: 'Community Garden Project',
  description: "Let's build a community garden",
  status: 'active' as const,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  completedAt: null,
};

const testVote = {
  id: 'vote-123',
  initiativeId: 'initiative-123',
  userId: 'user-456',
  voteType: 'upvote' as const,
  createdAt: new Date('2024-01-01'),
};

const testReport = {
  id: 'report-123',
  initiativeId: 'initiative-123',
  title: 'Progress Update',
  content: "We've made great progress",
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('InitiativeRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    initiativeRepository = new InitiativeRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh InitiativeRepository is created per test
  });

  describe('create', () => {
    it('should create an initiative', async () => {
      mockDb.returning.mockResolvedValue([testInitiative]);

      const result = await initiativeRepository.create(
        'council-123',
        'comm-123',
        {
          title: 'Community Garden Project',
          description: "Let's build a community garden",
        },
        'user-123'
      );

      expect(result).toEqual(testInitiative);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find initiative by id without user', async () => {
      // Mock initiative query
      mockDb.where.mockResolvedValueOnce([testInitiative]);
      // Mock vote counts query
      mockDb.where.mockResolvedValueOnce([{ upvotes: 10, downvotes: 2 }]);

      const result = await initiativeRepository.findById('initiative-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('initiative-123');
      expect(result?.upvotes).toBe(10);
      expect(result?.downvotes).toBe(2);
      expect(result?.userVote).toBeNull();
    });

    it('should find initiative with user vote', async () => {
      // Mock initiative query
      mockDb.where.mockResolvedValueOnce([testInitiative]);
      // Mock vote counts query
      mockDb.where.mockResolvedValueOnce([{ upvotes: 10, downvotes: 2 }]);
      // Mock user vote query
      mockDb.where.mockResolvedValueOnce([testVote]);

      const result = await initiativeRepository.findById('initiative-123', 'user-456');

      expect(result).not.toBeNull();
      expect(result?.userVote).toBe('upvote');
    });

    it('should return null if initiative not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await initiativeRepository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it("should return null user vote if user hasn't voted", async () => {
      mockDb.where.mockResolvedValueOnce([testInitiative]);
      mockDb.where.mockResolvedValueOnce([{ upvotes: 5, downvotes: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);

      const result = await initiativeRepository.findById('initiative-123', 'user-789');

      expect(result?.userVote).toBeNull();
    });
  });

  describe('findByCouncil', () => {
    it('should find initiatives by council with vote counts', async () => {
      // Query 1: Main initiatives query - .where() continues chain to .groupBy()
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([
        {
          initiative: testInitiative,
          upvotes: 15,
          downvotes: 3,
        },
      ]);
      // Query 2: User votes query - .where() resolves
      mockDb.where.mockResolvedValueOnce([testVote]);
      // Query 3: Count query - .where() resolves
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await initiativeRepository.findByCouncil('council-123', 'user-456');

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].upvotes).toBe(15);
      expect(result.initiatives[0].downvotes).toBe(3);
      expect(result.initiatives[0].userVote).toBe('upvote');
      expect(result.total).toBe(1);
    });

    it('should handle pagination', async () => {
      // Query 1: Main initiatives query with pagination
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([]);
      // Query 2: Count query (no user votes query since no initiatives)
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);

      // @ts-ignore
      const _result = await initiativeRepository.findByCouncil('council-123', 'user-123', {
        page: 2,
        limit: 10,
      });

      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should handle empty user votes', async () => {
      // Query 1: Main initiatives query
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([
        {
          initiative: testInitiative,
          upvotes: 5,
          downvotes: 0,
        },
      ]);
      // Query 2: User votes query - empty
      mockDb.where.mockResolvedValueOnce([]);
      // Query 3: Count query
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await initiativeRepository.findByCouncil('council-123', 'user-999');

      expect(result.initiatives[0].userVote).toBeNull();
    });

    it('should handle no initiatives', async () => {
      // Query 1: Main initiatives query - empty result
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([]);
      // Query 2: Count query only (no user votes query since no initiatives)
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);

      const result = await initiativeRepository.findByCouncil('council-123', 'user-123');

      expect(result.initiatives).toHaveLength(0);
      expect(result.total).toBe(0);
      // Should not query user votes if no initiatives
      expect(mockDb.where).toHaveBeenCalledTimes(2); // Main query + count query
    });
  });

  describe('update', () => {
    it('should update initiative', async () => {
      const updatedInitiative = {
        ...testInitiative,
        title: 'Updated Garden Project',
      };
      mockDb.returning.mockResolvedValue([updatedInitiative]);

      const result = await initiativeRepository.update('initiative-123', {
        title: 'Updated Garden Project',
      });

      expect(result?.title).toBe('Updated Garden Project');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should update status', async () => {
      const completedInitiative = {
        ...testInitiative,
        status: 'completed' as const,
        completedAt: new Date(),
      };
      mockDb.returning.mockResolvedValue([completedInitiative]);

      const result = await initiativeRepository.update('initiative-123', {
        status: 'completed',
      });

      expect(result?.status).toBe('completed');
    });

    it('should return undefined if initiative not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await initiativeRepository.update('nonexistent', {
        title: 'New Title',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete initiative', async () => {
      mockDb.returning.mockResolvedValue([testInitiative]);

      const result = await initiativeRepository.delete('initiative-123');

      expect(result).toEqual(testInitiative);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return undefined if initiative not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await initiativeRepository.delete('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('vote', () => {
    it('should create new vote', async () => {
      // No existing vote
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValue([testVote]);

      const result = await initiativeRepository.vote('initiative-123', 'user-456', 'upvote');

      expect(result).toEqual(testVote);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should update existing vote', async () => {
      const existingVote = { ...testVote, voteType: 'upvote' as const };
      const updatedVote = { ...testVote, voteType: 'downvote' as const };

      mockDb.where.mockResolvedValueOnce([existingVote]);
      mockDb.returning.mockResolvedValue([updatedVote]);

      const result = await initiativeRepository.vote('initiative-123', 'user-456', 'downvote');

      expect(result?.voteType).toBe('downvote');
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should update vote if same type (allowing vote refresh)', async () => {
      const existingVote = { ...testVote, voteType: 'upvote' as const };

      mockDb.where.mockResolvedValueOnce([existingVote]);
      mockDb.returning.mockResolvedValue([existingVote]);

      const result = await initiativeRepository.vote('initiative-123', 'user-456', 'upvote');

      // Implementation updates vote with new timestamp, not delete
      expect(mockDb.update).toHaveBeenCalled();
      expect(result?.voteType).toBe('upvote');
    });
  });

  describe('removeVote', () => {
    it('should remove user vote', async () => {
      mockDb.returning.mockResolvedValue([testVote]);

      const result = await initiativeRepository.removeVote('initiative-123', 'user-456');

      expect(result).toEqual(testVote);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('Report Operations', () => {
    describe('createReport', () => {
      it('should create an initiative report', async () => {
        mockDb.returning.mockResolvedValue([testReport]);

        const result = await initiativeRepository.createReport(
          'initiative-123',
          {
            title: 'Progress Update',
            content: "We've made great progress",
          },
          'user-123'
        );

        expect(result).toEqual(testReport);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
      });
    });

    describe('getReports', () => {
      it('should get reports for initiative', async () => {
        mockDb.orderBy.mockResolvedValue([testReport]);

        const result = await initiativeRepository.getReports('initiative-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testReport);
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should return empty array if no reports', async () => {
        mockDb.orderBy.mockResolvedValue([]);

        const result = await initiativeRepository.getReports('initiative-123');

        expect(result).toHaveLength(0);
      });
    });

    describe('findReportById', () => {
      it('should find report by id', async () => {
        mockDb.where.mockResolvedValue([testReport]);

        const result = await initiativeRepository.findReportById('report-123');

        expect(result).toEqual(testReport);
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await initiativeRepository.findReportById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('updateReport', () => {
      it('should update report', async () => {
        const updatedReport = {
          ...testReport,
          title: 'Updated Progress',
        };
        mockDb.returning.mockResolvedValue([updatedReport]);

        const result = await initiativeRepository.updateReport('report-123', {
          title: 'Updated Progress',
        });

        expect(result?.title).toBe('Updated Progress');
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('deleteReport', () => {
      it('should delete report', async () => {
        mockDb.returning.mockResolvedValue([testReport]);

        const result = await initiativeRepository.deleteReport('report-123');

        expect(result).toEqual(testReport);
        expect(mockDb.delete).toHaveBeenCalled();
      });
    });
  });

  describe('Comment Operations', () => {
    const testComment = {
      id: 'comment-123',
      initiativeId: 'initiative-123',
      content: 'Great initiative!',
      authorId: 'user-789',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    describe('createComment', () => {
      it('should create a comment', async () => {
        mockDb.returning.mockResolvedValue([testComment]);

        const result = await initiativeRepository.createComment(
          'initiative-123',
          'Great initiative!',
          'user-789'
        );

        expect(result).toEqual(testComment);
        expect(mockDb.insert).toHaveBeenCalled();
      });
    });

    describe('getComments', () => {
      it('should get comments for initiative', async () => {
        mockDb.orderBy.mockResolvedValue([testComment]);

        const result = await initiativeRepository.getComments('initiative-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testComment);
      });
    });

    describe('deleteComment', () => {
      it('should delete comment', async () => {
        mockDb.returning.mockResolvedValue([testComment]);

        const result = await initiativeRepository.deleteComment('comment-123');

        expect(result).toEqual(testComment);
        expect(mockDb.delete).toHaveBeenCalled();
      });
    });
  });
});
