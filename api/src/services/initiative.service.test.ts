/**
 * Initiative Service Unit Tests
 *
 * Test Coverage:
 * - Permission checks for initiative operations
 * - Initiative CRUD operations
 * - Voting on initiatives
 * - Report creation and management
 * - Comment management
 * - Error handling
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { initiativeService } from './initiative.service';
import { initiativeRepository } from '@/repositories/initiative.repository';
import { councilRepository } from '@/repositories/council.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { appUserRepository } from '@/repositories/appUser.repository';

// Valid UUIDs for tests
const COMMUNITY_ID = '550e8400-e29b-41d4-a716-446655440001';
const COUNCIL_ID = '550e8400-e29b-41d4-a716-446655440002';
const USER_ID = '550e8400-e29b-41d4-a716-446655440003';
const INITIATIVE_ID = '550e8400-e29b-41d4-a716-446655440004';
const REPORT_ID = '550e8400-e29b-41d4-a716-446655440005';

// Mock dependencies
const mockInitiativeRepository = {
  create: mock(() => Promise.resolve({
    id: INITIATIVE_ID,
    title: 'Community Garden',
    councilId: COUNCIL_ID,
    communityId: COMMUNITY_ID,
    description: 'Build a community garden',
    createdBy: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  findByCouncil: mock(() => Promise.resolve({
    initiatives: [],
    total: 0
  })),
  findById: mock(() => Promise.resolve({
    id: INITIATIVE_ID,
    title: 'Community Garden',
    councilId: COUNCIL_ID,
    communityId: COMMUNITY_ID,
    description: 'Build a community garden',
    upvotes: 0,
    downvotes: 0,
    userVote: null,
  })),
  update: mock(() => Promise.resolve({
    id: INITIATIVE_ID,
    title: 'Updated Initiative',
  })),
  delete: mock(() => Promise.resolve()),
  vote: mock(() => Promise.resolve()),
  removeVote: mock(() => Promise.resolve()),
  createReport: mock(() => Promise.resolve({
    id: REPORT_ID,
    initiativeId: INITIATIVE_ID,
    title: 'Progress Report',
    content: 'Great progress!',
  })),
  findReportsByInitiative: mock(() => Promise.resolve({ reports: [], total: 0 })),
  findReportById: mock(() => Promise.resolve({
    id: REPORT_ID,
    initiativeId: INITIATIVE_ID,
  })),
  createComment: mock(() => Promise.resolve({
    id: '550e8400-e29b-41d4-a716-446655440006',
    initiativeId: INITIATIVE_ID,
    content: 'Great initiative!',
    authorId: USER_ID,
  })),
  findCommentsByInitiative: mock(() => Promise.resolve({ comments: [], total: 0 })),
  createReportComment: mock(() => Promise.resolve({
    id: '550e8400-e29b-41d4-a716-446655440007',
    reportId: REPORT_ID,
    content: 'Good report!',
    authorId: USER_ID,
  })),
  findCommentsByReport: mock(() => Promise.resolve({ comments: [], total: 0 })),
};

const mockCouncilRepository = {
  findById: mock(() => Promise.resolve({
    id: COUNCIL_ID,
    communityId: COMMUNITY_ID,
    name: 'Test Council',
  })),
  isManager: mock(() => Promise.resolve(false)),
};

const mockCommunityMemberRepository = {
  isAdmin: mock(() => Promise.resolve(false)),
  getUserRole: mock(() => Promise.resolve('member')),
};

const mockAppUserRepository = {
  findById: mock(() => Promise.resolve({
    id: USER_ID,
    email: 'test@example.com',
    displayName: 'Test User',
  })),
};

describe('InitiativeService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockInitiativeRepository).forEach(m => m.mockReset());
    Object.values(mockCouncilRepository).forEach(m => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach(m => m.mockReset());
    Object.values(mockAppUserRepository).forEach(m => m.mockReset());

    // Replace dependencies with mocks
    (initiativeRepository.create as any) = mockInitiativeRepository.create;
    (initiativeRepository.findByCouncil as any) = mockInitiativeRepository.findByCouncil;
    (initiativeRepository.findById as any) = mockInitiativeRepository.findById;
    (initiativeRepository.update as any) = mockInitiativeRepository.update;
    (initiativeRepository.delete as any) = mockInitiativeRepository.delete;
    (initiativeRepository.vote as any) = mockInitiativeRepository.vote;
    (initiativeRepository.removeVote as any) = mockInitiativeRepository.removeVote;
    (initiativeRepository.createReport as any) = mockInitiativeRepository.createReport;
    (initiativeRepository.findReportsByInitiative as any) = mockInitiativeRepository.findReportsByInitiative;
    (initiativeRepository.findReportById as any) = mockInitiativeRepository.findReportById;
    (initiativeRepository.createComment as any) = mockInitiativeRepository.createComment;
    (initiativeRepository.findCommentsByInitiative as any) = mockInitiativeRepository.findCommentsByInitiative;
    (initiativeRepository.createReportComment as any) = mockInitiativeRepository.createReportComment;
    (initiativeRepository.findCommentsByReport as any) = mockInitiativeRepository.findCommentsByReport;

    (councilRepository.findById as any) = mockCouncilRepository.findById;
    (councilRepository.isManager as any) = mockCouncilRepository.isManager;

    (communityMemberRepository.isAdmin as any) = mockCommunityMemberRepository.isAdmin;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;

    (appUserRepository.findById as any) = mockAppUserRepository.findById;

    // Default mock behaviors
    mockCouncilRepository.findById.mockResolvedValue({
      id: COUNCIL_ID,
      communityId: COMMUNITY_ID,
      name: 'Test Council',
    });
    mockCouncilRepository.isManager.mockResolvedValue(false);
    mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);
    mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
    mockAppUserRepository.findById.mockResolvedValue({
      id: USER_ID,
      email: 'test@example.com',
      displayName: 'Test User',
    });
  });

  describe('createInitiative', () => {
    it('should allow council manager to create initiative', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(true);
      mockInitiativeRepository.create.mockResolvedValue({
        id: INITIATIVE_ID,
        title: 'Community Garden',
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
        description: 'Build a community garden',
        createdBy: USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await initiativeService.createInitiative(
        COUNCIL_ID,
        {
          title: 'Community Garden',
          description: 'Build a community garden',
        },
        USER_ID
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(INITIATIVE_ID);
      expect(mockCouncilRepository.isManager).toHaveBeenCalledWith(COUNCIL_ID, USER_ID);
    });

    it('should allow admin to create initiative', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockInitiativeRepository.create.mockResolvedValue({
        id: INITIATIVE_ID,
        title: 'Community Garden',
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
        description: 'Build a community garden',
        createdBy: USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await initiativeService.createInitiative(
        COUNCIL_ID,
        {
          title: 'Community Garden',
          description: 'Build a community garden',
        },
        USER_ID
      );

      expect(result).toBeDefined();
      expect(mockCommunityMemberRepository.isAdmin).toHaveBeenCalled();
    });

    it('should reject non-manager from creating initiative', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(false);
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        initiativeService.createInitiative(
          COUNCIL_ID,
          {
            title: 'Initiative',
            description: 'Some description that is long enough',
          },
          USER_ID
        )
      ).rejects.toThrow('Forbidden: only admins or council managers can create initiatives');
    });

    it('should validate title length (too short)', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(true);

      await expect(
        initiativeService.createInitiative(
          COUNCIL_ID,
          {
            title: 'AB',
            description: 'Some description that is long enough',
          },
          USER_ID
        )
      ).rejects.toThrow('Initiative title must be between 3 and 200 characters');
    });

    it('should validate description length', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(true);

      await expect(
        initiativeService.createInitiative(
          COUNCIL_ID,
          {
            title: 'Valid Title',
            description: 'Short',
          },
          USER_ID
        )
      ).rejects.toThrow('Initiative description must be at least 10 characters');
    });

    it('should handle non-existent council', async () => {
      mockCouncilRepository.findById.mockResolvedValue(null);

      await expect(
        initiativeService.createInitiative(
          COUNCIL_ID,
          {
            title: 'Initiative',
            description: 'Description that is long enough',
          },
          USER_ID
        )
      ).rejects.toThrow('Council not found');
    });
  });

  describe('listInitiatives', () => {
    it('should allow member to list initiatives', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.findByCouncil.mockResolvedValue({
        initiatives: [{
          id: INITIATIVE_ID,
          title: 'Community Garden',
          upvotes: 5,
          downvotes: 1,
          userVote: null,
        }],
        total: 1,
      });

      const result = await initiativeService.listInitiatives(
        COUNCIL_ID,
        USER_ID,
        { page: 1, limit: 20 }
      );

      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.initiatives.length).toBe(1);
    });

    it('should reject non-member from listing initiatives', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        initiativeService.listInitiatives(COUNCIL_ID, USER_ID)
      ).rejects.toThrow('Forbidden: not a member of this community');
    });

    it('should support pagination', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.findByCouncil.mockResolvedValue({
        initiatives: [],
        total: 50,
      });

      const result = await initiativeService.listInitiatives(
        COUNCIL_ID,
        USER_ID,
        { page: 2, limit: 10 }
      );

      expect(mockInitiativeRepository.findByCouncil).toHaveBeenCalledWith(
        COUNCIL_ID,
        USER_ID,
        { page: 2, limit: 10 }
      );
    });
  });

  describe('getInitiative', () => {
    it('should allow member to get initiative by ID', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        title: 'Community Garden',
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
        upvotes: 5,
        downvotes: 1,
      });

      const result = await initiativeService.getInitiative(INITIATIVE_ID, USER_ID);

      expect(result).toBeDefined();
      expect(result.id).toBe(INITIATIVE_ID);
    });

    it('should reject non-member from getting initiative', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        initiativeService.getInitiative(INITIATIVE_ID, USER_ID)
      ).rejects.toThrow('Forbidden: not a member of this community');
    });

    it('should handle non-existent initiative', async () => {
      mockInitiativeRepository.findById.mockResolvedValue(null);

      await expect(
        initiativeService.getInitiative(INITIATIVE_ID, USER_ID)
      ).rejects.toThrow('Initiative not found');
    });
  });

  describe('updateInitiative', () => {
    it('should allow council manager to update initiative', async () => {
      // First call to findById in service
      mockInitiativeRepository.findById
        .mockResolvedValueOnce({
          id: INITIATIVE_ID,
          councilId: COUNCIL_ID,
          communityId: COMMUNITY_ID,
        })
        // Second call to findById after update
        .mockResolvedValueOnce({
          id: INITIATIVE_ID,
          title: 'Updated Initiative',
          councilId: COUNCIL_ID,
          communityId: COMMUNITY_ID,
          upvotes: 0,
          downvotes: 0,
        });
      mockCouncilRepository.isManager.mockResolvedValue(true);
      mockInitiativeRepository.update.mockResolvedValue({
        id: INITIATIVE_ID,
        title: 'Updated Initiative',
      });

      const result = await initiativeService.updateInitiative(
        INITIATIVE_ID,
        { title: 'Updated Initiative' },
        USER_ID
      );

      expect(result).toBeDefined();
      expect(mockCouncilRepository.isManager).toHaveBeenCalledWith(COUNCIL_ID, USER_ID);
    });

    it('should reject non-manager from updating initiative', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
      });
      mockCouncilRepository.isManager.mockResolvedValue(false);
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        initiativeService.updateInitiative(
          INITIATIVE_ID,
          { title: 'Updated' },
          USER_ID
        )
      ).rejects.toThrow('Forbidden: only admins or council managers can update initiatives');
    });
  });

  describe('deleteInitiative', () => {
    it('should allow manager to delete initiative', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
      });
      mockCouncilRepository.isManager.mockResolvedValue(true);
      mockInitiativeRepository.delete.mockResolvedValue(undefined);

      const result = await initiativeService.deleteInitiative(INITIATIVE_ID, USER_ID);

      expect(result).toEqual({ success: true });
      expect(mockInitiativeRepository.delete).toHaveBeenCalledWith(INITIATIVE_ID);
    });

    it('should reject non-authorized user from deleting initiative', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
      });
      mockCouncilRepository.isManager.mockResolvedValue(false);
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        initiativeService.deleteInitiative(INITIATIVE_ID, USER_ID)
      ).rejects.toThrow('Forbidden: only admins or council managers can delete initiatives');
    });
  });

  describe('Voting', () => {
    it('should allow member to vote on initiative', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.vote.mockResolvedValue(undefined);
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        upvotes: 1,
        downvotes: 0,
        userVote: 'upvote',
      });

      const result = await initiativeService.voteOnInitiative(
        INITIATIVE_ID,
        'upvote',
        USER_ID
      );

      expect(result).toBeDefined();
      expect(mockInitiativeRepository.vote).toHaveBeenCalledWith(INITIATIVE_ID, USER_ID, 'upvote');
    });

    it('should reject non-member from voting', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        initiativeService.voteOnInitiative(INITIATIVE_ID, 'upvote', USER_ID)
      ).rejects.toThrow('Forbidden: not a member of this community');
    });

    it('should allow member to remove vote', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.removeVote.mockResolvedValue(undefined);
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      });

      const result = await initiativeService.removeVote(INITIATIVE_ID, USER_ID);

      expect(result).toBeDefined();
      expect(mockInitiativeRepository.removeVote).toHaveBeenCalledWith(INITIATIVE_ID, USER_ID);
    });
  });

  describe('Reports', () => {
    it('should allow council manager to create report', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
      });
      mockCouncilRepository.isManager.mockResolvedValue(true);
      mockInitiativeRepository.createReport.mockResolvedValue({
        id: REPORT_ID,
        initiativeId: INITIATIVE_ID,
        title: 'Progress Report',
        content: 'Great progress!',
      });

      const result = await initiativeService.createReport(
        INITIATIVE_ID,
        {
          title: 'Progress Report',
          content: 'Great progress on the initiative!',
        },
        USER_ID
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(REPORT_ID);
    });

    it('should reject non-manager from creating report', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        councilId: COUNCIL_ID,
        communityId: COMMUNITY_ID,
      });
      mockCouncilRepository.isManager.mockResolvedValue(false);
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        initiativeService.createReport(
          INITIATIVE_ID,
          {
            title: 'Report',
            content: 'Some content that is long enough',
          },
          USER_ID
        )
      ).rejects.toThrow('Forbidden: only admins or council managers can create reports');
    });

    it('should allow member to list reports', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.findReportsByInitiative.mockResolvedValue({
        reports: [{ id: REPORT_ID }],
        total: 1,
      });

      const result = await initiativeService.listReports(INITIATIVE_ID, USER_ID);

      expect(result).toBeDefined();
      expect(result.reports).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('Comments', () => {
    it('should allow member to create comment', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.createComment.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440006',
        initiativeId: INITIATIVE_ID,
        content: 'Great initiative!',
        authorId: USER_ID,
        createdAt: new Date(),
      });

      const result = await initiativeService.createComment(
        INITIATIVE_ID,
        'Great initiative!',
        USER_ID
      );

      expect(result).toBeDefined();
      expect(result.authorName).toBe('Test User');
    });

    it('should reject non-member from creating comment', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        initiativeService.createComment(INITIATIVE_ID, 'Comment', USER_ID)
      ).rejects.toThrow('Forbidden: not a member of this community');
    });

    it('should allow member to list comments', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.findCommentsByInitiative.mockResolvedValue({
        comments: [{
          id: '550e8400-e29b-41d4-a716-446655440006',
          authorId: USER_ID,
          content: 'Great!',
        }],
        total: 1,
      });

      const result = await initiativeService.listComments(INITIATIVE_ID, USER_ID);

      expect(result).toBeDefined();
      expect(result.comments).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should validate comment content', async () => {
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(
        initiativeService.createComment(INITIATIVE_ID, '', USER_ID)
      ).rejects.toThrow('Comment must be between 1 and 5000 characters');
    });
  });

  describe('Report Comments', () => {
    it('should allow member to create report comment', async () => {
      mockInitiativeRepository.findReportById.mockResolvedValue({
        id: REPORT_ID,
        initiativeId: INITIATIVE_ID,
      });
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.createReportComment.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440007',
        reportId: REPORT_ID,
        content: 'Good report!',
        authorId: USER_ID,
        createdAt: new Date(),
      });

      const result = await initiativeService.createReportComment(
        REPORT_ID,
        'Good report!',
        USER_ID
      );

      expect(result).toBeDefined();
      expect(result.authorName).toBe('Test User');
    });

    it('should allow member to list report comments', async () => {
      mockInitiativeRepository.findReportById.mockResolvedValue({
        id: REPORT_ID,
        initiativeId: INITIATIVE_ID,
      });
      mockInitiativeRepository.findById.mockResolvedValue({
        id: INITIATIVE_ID,
        communityId: COMMUNITY_ID,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockInitiativeRepository.findCommentsByReport.mockResolvedValue({
        comments: [{
          id: '550e8400-e29b-41d4-a716-446655440007',
          authorId: USER_ID,
          content: 'Great!',
        }],
        total: 1,
      });

      const result = await initiativeService.listReportComments(REPORT_ID, USER_ID);

      expect(result).toBeDefined();
      expect(result.comments).toBeDefined();
      expect(result.total).toBe(1);
    });
  });
});
