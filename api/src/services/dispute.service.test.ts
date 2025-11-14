import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { DisputeService } from './dispute.service';
import { disputeRepository } from '../repositories/dispute.repository';
import { communityRepository } from '../repositories/community.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '../utils/errors';

const mockDisputeRepository = {
  createDispute: mock(() => Promise.resolve(testDispute)),
  findDisputeById: mock(() => Promise.resolve(testDispute)),
  findDisputesByCommunity: mock(() => Promise.resolve({ disputes: [testDispute], total: 1 })),
  addParticipant: mock(() => Promise.resolve(testParticipant)),
  isParticipant: mock(() => Promise.resolve(false)),
  proposeMediator: mock(() => Promise.resolve(testMediator)),
  findMediatorById: mock(() => Promise.resolve(testMediator)),
  updateMediatorStatus: mock(() => Promise.resolve(testMediatorAccepted)),
  isAcceptedMediator: mock(() => Promise.resolve(false)),
  createResolution: mock(() => Promise.resolve(testResolution)),
  updateDispute: mock(() => Promise.resolve(testDisputeResolved)),
  createMessage: mock(() => Promise.resolve(testMessage)),
  findMessagesByDispute: mock(() => Promise.resolve({ messages: [testMessage], total: 1 })),
  createHistory: mock(() => Promise.resolve(testHistory)),
  findParticipant: mock(() => Promise.resolve(undefined)),
  findMediatorProposal: mock(() => Promise.resolve(undefined)),
};

const mockCommunityRepository = {
  findById: mock(() => Promise.resolve(testCommunity)),
};

const mockCommunityMemberRepository = {
  isMember: mock(() => Promise.resolve(true)),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
};

const testCommunity = {
  id: 'comm-123',
  name: 'Test Community',
  allowOpenResolutions: true,
};

const testDispute = {
  id: 'dispute-123',
  communityId: 'comm-123',
  title: 'Test Dispute',
  description: 'Test description',
  status: 'open' as const,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  resolvedAt: null,
};

const testDisputeResolved = {
  ...testDispute,
  status: 'resolved' as const,
  resolvedAt: new Date('2024-01-02'),
};

const testParticipant = {
  id: 'participant-123',
  disputeId: 'dispute-123',
  userId: 'user-123',
  role: 'initiator' as const,
  addedAt: new Date('2024-01-01'),
  addedBy: 'user-123',
};

const testMediator = {
  id: 'mediator-123',
  disputeId: 'dispute-123',
  userId: 'user-456',
  status: 'proposed' as const,
  proposedAt: new Date('2024-01-01'),
  respondedAt: null,
  respondedBy: null,
};

const testMediatorAccepted = {
  ...testMediator,
  status: 'accepted' as const,
  respondedAt: new Date('2024-01-02'),
  respondedBy: 'user-123',
};

const testResolution = {
  id: 'resolution-123',
  disputeId: 'dispute-123',
  resolutionType: 'closed' as const,
  resolution: 'Resolved amicably',
  createdBy: 'user-456',
  createdAt: new Date('2024-01-02'),
  isPublic: false,
};

const testMessage = {
  id: 'message-123',
  disputeId: 'dispute-123',
  userId: 'user-123',
  message: 'Test message',
  createdAt: new Date('2024-01-01'),
  visibleToParticipants: true,
  visibleToMediators: true,
};

const testHistory = {
  id: 'history-123',
  disputeId: 'dispute-123',
  action: 'created',
  performedBy: 'user-123',
  performedAt: new Date('2024-01-01'),
  metadata: null,
};

describe('DisputeService', () => {
  let disputeService: DisputeService;

  beforeEach(() => {
    Object.values(mockDisputeRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    (disputeRepository.createDispute as any) = mockDisputeRepository.createDispute;
    (disputeRepository.findDisputeById as any) = mockDisputeRepository.findDisputeById;
    (disputeRepository.findDisputesByCommunity as any) =
      mockDisputeRepository.findDisputesByCommunity;
    (disputeRepository.addParticipant as any) = mockDisputeRepository.addParticipant;
    (disputeRepository.isParticipant as any) = mockDisputeRepository.isParticipant;
    (disputeRepository.proposeMediator as any) = mockDisputeRepository.proposeMediator;
    (disputeRepository.findMediatorById as any) = mockDisputeRepository.findMediatorById;
    (disputeRepository.updateMediatorStatus as any) = mockDisputeRepository.updateMediatorStatus;
    (disputeRepository.isAcceptedMediator as any) = mockDisputeRepository.isAcceptedMediator;
    (disputeRepository.createResolution as any) = mockDisputeRepository.createResolution;
    (disputeRepository.updateDispute as any) = mockDisputeRepository.updateDispute;
    (disputeRepository.createMessage as any) = mockDisputeRepository.createMessage;
    (disputeRepository.findMessagesByDispute as any) = mockDisputeRepository.findMessagesByDispute;
    (disputeRepository.createHistory as any) = mockDisputeRepository.createHistory;
    (disputeRepository.findParticipant as any) = mockDisputeRepository.findParticipant;
    (disputeRepository.findMediatorProposal as any) = mockDisputeRepository.findMediatorProposal;

    (communityRepository.findById as any) = mockCommunityRepository.findById;
    (communityMemberRepository.isMember as any) = mockCommunityMemberRepository.isMember;
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;

    disputeService = new DisputeService();
  });

  describe('createDispute', () => {
    it('should create dispute and add initiator', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(true);

      const result = await disputeService.createDispute('comm-123', 'user-123', {
        title: 'Test Dispute',
        description: 'Test description',
      });

      expect(result).toEqual(testDispute);
      expect(mockDisputeRepository.createDispute).toHaveBeenCalledWith({
        communityId: 'comm-123',
        title: 'Test Dispute',
        description: 'Test description',
        createdBy: 'user-123',
      });
      expect(mockDisputeRepository.addParticipant).toHaveBeenCalled();
      expect(mockDisputeRepository.createHistory).toHaveBeenCalled();
    });

    it('should throw error if community not found', async () => {
      mockCommunityRepository.findById.mockResolvedValue(null);

      await expect(
        disputeService.createDispute('comm-123', 'user-123', {
          title: 'Test',
          description: 'Test',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if user lacks permission', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        disputeService.createDispute('comm-123', 'user-123', {
          title: 'Test',
          description: 'Test',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('getDisputeById', () => {
    it('should return dispute if user has access', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(true);
      mockDisputeRepository.findDisputeById.mockResolvedValue(testDispute);

      const result = await disputeService.getDisputeById('dispute-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('dispute-123');
    });

    it('should throw error if dispute not found', async () => {
      mockDisputeRepository.findDisputeById.mockResolvedValue(undefined);

      await expect(disputeService.getDisputeById('dispute-123', 'user-123')).rejects.toThrow(
        AppError
      );
    });

    it('should throw error if user lacks access', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(false);
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(false);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(disputeService.getDisputeById('dispute-123', 'user-123')).rejects.toThrow(
        AppError
      );
    });
  });

  describe('proposeAsMediator', () => {
    it('should allow user with sufficient trust to propose', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockDisputeRepository.findMediatorProposal.mockResolvedValue(undefined);

      const result = await disputeService.proposeAsMediator('dispute-123', 'user-456');

      expect(result).toEqual(testMediator);
      expect(mockDisputeRepository.proposeMediator).toHaveBeenCalled();
      expect(mockDisputeRepository.createHistory).toHaveBeenCalled();
    });

    it('should throw error if user lacks permission', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(disputeService.proposeAsMediator('dispute-123', 'user-456')).rejects.toThrow(
        AppError
      );
    });

    it('should throw error if user already proposed', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockDisputeRepository.findMediatorProposal.mockResolvedValue(testMediator);

      await expect(disputeService.proposeAsMediator('dispute-123', 'user-456')).rejects.toThrow(
        AppError
      );
    });
  });

  describe('respondToMediatorProposal', () => {
    it('should allow participant to accept mediator', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(true);
      mockDisputeRepository.updateDispute.mockResolvedValue(testDisputeResolved);

      const result = await disputeService.respondToMediatorProposal(
        'mediator-123',
        'user-123',
        true
      );

      expect(result).toEqual(testMediatorAccepted);
      expect(mockDisputeRepository.updateMediatorStatus).toHaveBeenCalledWith('mediator-123', {
        status: 'accepted',
        respondedBy: 'user-123',
      });
      expect(mockDisputeRepository.createHistory).toHaveBeenCalled();
    });

    it('should throw error if user is not participant', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(false);

      await expect(
        disputeService.respondToMediatorProposal('mediator-123', 'user-456', true)
      ).rejects.toThrow(AppError);
    });
  });

  describe('createResolution', () => {
    it('should allow accepted mediator to create resolution', async () => {
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(true);

      const result = await disputeService.createResolution('dispute-123', 'user-456', {
        resolutionType: 'closed',
        resolution: 'Resolved amicably',
      });

      expect(result).toEqual(testResolution);
      expect(mockDisputeRepository.createResolution).toHaveBeenCalled();
      expect(mockDisputeRepository.updateDispute).toHaveBeenCalledWith('dispute-123', {
        status: 'resolved',
        resolvedAt: expect.any(Date),
      });
      expect(mockDisputeRepository.createHistory).toHaveBeenCalled();
    });

    it('should throw error if user is not accepted mediator', async () => {
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(false);

      await expect(
        disputeService.createResolution('dispute-123', 'user-123', {
          resolutionType: 'closed',
          resolution: 'Test',
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw error if open resolutions not allowed', async () => {
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(true);
      mockCommunityRepository.findById.mockResolvedValue({
        ...testCommunity,
        allowOpenResolutions: false,
      });

      await expect(
        disputeService.createResolution('dispute-123', 'user-456', {
          resolutionType: 'open',
          resolution: 'Test',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('addMessage', () => {
    it('should allow participant to add message', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(true);

      const result = await disputeService.addMessage('dispute-123', 'user-123', {
        message: 'Test message',
      });

      expect(result).toEqual(testMessage);
      expect(mockDisputeRepository.createMessage).toHaveBeenCalled();
    });

    it('should throw error if user lacks access', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(false);
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(false);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        disputeService.addMessage('dispute-123', 'user-456', { message: 'Test' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateDisputeStatus', () => {
    it('should allow participant to update status', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(true);

      const result = await disputeService.updateDisputeStatus('dispute-123', 'user-123', 'closed');

      expect(result).toEqual(testDisputeResolved);
      expect(mockDisputeRepository.updateDispute).toHaveBeenCalled();
      expect(mockDisputeRepository.createHistory).toHaveBeenCalled();
    });

    it('should allow mediator to update status', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(false);
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(true);

      const result = await disputeService.updateDisputeStatus('dispute-123', 'user-456', 'closed');

      expect(result).toEqual(testDisputeResolved);
    });

    it('should throw error if user lacks permission', async () => {
      mockDisputeRepository.isParticipant.mockResolvedValue(false);
      mockDisputeRepository.isAcceptedMediator.mockResolvedValue(false);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        disputeService.updateDisputeStatus('dispute-123', 'user-789', 'closed')
      ).rejects.toThrow(AppError);
    });
  });
});
