import { describe, it, expect, beforeEach } from 'bun:test';
import { DisputeRepository } from './dispute.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

const mockDb = createThenableMockDb();
let disputeRepository: DisputeRepository;

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

describe('DisputeRepository', () => {
  beforeEach(() => {
    setupMockDbChains(mockDb);
    disputeRepository = new DisputeRepository(mockDb as any);
  });

  describe('createDispute', () => {
    it('should create a dispute', async () => {
      mockDb.returning.mockResolvedValue([testDispute]);

      const result = await disputeRepository.createDispute({
        communityId: 'comm-123',
        title: 'Test Dispute',
        description: 'Test description',
        createdBy: 'user-123',
      });

      expect(result).toEqual(testDispute);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('findDisputeById', () => {
    it('should find dispute by id', async () => {
      mockDb.where.mockResolvedValue([testDispute]);

      const result = await disputeRepository.findDisputeById('dispute-123');

      expect(result).toEqual(testDispute);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await disputeRepository.findDisputeById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findDisputesByCommunity', () => {
    it('should list disputes with pagination', async () => {
      mockDb.offset.mockResolvedValue([testDispute]);
      mockDb.where.mockResolvedValueOnce({ count: 1 });

      const result = await disputeRepository.findDisputesByCommunity('comm-123', {
        limit: 20,
        offset: 0,
      });

      expect(result.disputes).toEqual([testDispute]);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockDb.offset.mockResolvedValue([testDispute]);
      mockDb.where.mockResolvedValueOnce({ count: 1 });

      const result = await disputeRepository.findDisputesByCommunity('comm-123', {
        limit: 20,
        offset: 0,
        status: 'open',
      });

      expect(result.disputes).toEqual([testDispute]);
    });
  });

  describe('updateDispute', () => {
    it('should update dispute', async () => {
      const updatedDispute = { ...testDispute, status: 'resolved' as const };
      mockDb.returning.mockResolvedValue([updatedDispute]);

      const result = await disputeRepository.updateDispute('dispute-123', {
        status: 'resolved',
      });

      expect(result?.status).toBe('resolved');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });
  });

  describe('addParticipant', () => {
    it('should add participant to dispute', async () => {
      mockDb.returning.mockResolvedValue([testParticipant]);

      const result = await disputeRepository.addParticipant({
        disputeId: 'dispute-123',
        userId: 'user-123',
        role: 'initiator',
        addedBy: 'user-123',
      });

      expect(result).toEqual(testParticipant);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  describe('findParticipantsByDispute', () => {
    it('should find all participants for dispute', async () => {
      mockDb.where.mockResolvedValue([testParticipant]);

      const result = await disputeRepository.findParticipantsByDispute('dispute-123');

      expect(result).toEqual([testParticipant]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('isParticipant', () => {
    it('should return true if user is participant', async () => {
      mockDb.where.mockResolvedValue([testParticipant]);

      const result = await disputeRepository.isParticipant('dispute-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false if user is not participant', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await disputeRepository.isParticipant('dispute-123', 'user-456');

      expect(result).toBe(false);
    });
  });

  describe('proposeMediator', () => {
    it('should propose mediator', async () => {
      mockDb.returning.mockResolvedValue([testMediator]);

      const result = await disputeRepository.proposeMediator({
        disputeId: 'dispute-123',
        userId: 'user-456',
      });

      expect(result).toEqual(testMediator);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  describe('updateMediatorStatus', () => {
    it('should update mediator status to accepted', async () => {
      const acceptedMediator = {
        ...testMediator,
        status: 'accepted' as const,
        respondedAt: new Date('2024-01-02'),
        respondedBy: 'user-123',
      };
      mockDb.returning.mockResolvedValue([acceptedMediator]);

      const result = await disputeRepository.updateMediatorStatus('mediator-123', {
        status: 'accepted',
        respondedBy: 'user-123',
      });

      expect(result?.status).toBe('accepted');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });
  });

  describe('isAcceptedMediator', () => {
    it('should return true if user is accepted mediator', async () => {
      const acceptedMediator = { ...testMediator, status: 'accepted' as const };
      mockDb.where.mockResolvedValue([acceptedMediator]);

      const result = await disputeRepository.isAcceptedMediator('dispute-123', 'user-456');

      expect(result).toBe(true);
    });

    it('should return false if user is not accepted mediator', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await disputeRepository.isAcceptedMediator('dispute-123', 'user-789');

      expect(result).toBe(false);
    });
  });

  describe('createResolution', () => {
    it('should create resolution', async () => {
      const resolution = {
        id: 'resolution-123',
        disputeId: 'dispute-123',
        resolutionType: 'closed' as const,
        resolution: 'Resolved amicably',
        createdBy: 'user-456',
        createdAt: new Date('2024-01-02'),
        isPublic: false,
      };
      mockDb.returning.mockResolvedValue([resolution]);

      const result = await disputeRepository.createResolution({
        disputeId: 'dispute-123',
        resolutionType: 'closed',
        resolution: 'Resolved amicably',
        createdBy: 'user-456',
        isPublic: false,
      });

      expect(result).toEqual(resolution);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  describe('createMessage', () => {
    it('should create message', async () => {
      const message = {
        id: 'message-123',
        disputeId: 'dispute-123',
        userId: 'user-123',
        message: 'Test message',
        createdAt: new Date('2024-01-01'),
        visibleToParticipants: true,
        visibleToMediators: true,
      };
      mockDb.returning.mockResolvedValue([message]);

      const result = await disputeRepository.createMessage({
        disputeId: 'dispute-123',
        userId: 'user-123',
        message: 'Test message',
      });

      expect(result).toEqual(message);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  describe('findMessagesByDispute', () => {
    it('should find messages with pagination', async () => {
      const messages = [
        {
          id: 'message-1',
          disputeId: 'dispute-123',
          userId: 'user-123',
          message: 'Message 1',
          createdAt: new Date('2024-01-01'),
          visibleToParticipants: true,
          visibleToMediators: true,
        },
      ];
      mockDb.offset.mockResolvedValue(messages);
      mockDb.where.mockResolvedValueOnce({ count: 1 });

      const result = await disputeRepository.findMessagesByDispute('dispute-123', {
        limit: 50,
        offset: 0,
      });

      expect(result.messages).toEqual(messages);
      expect(result.total).toBe(1);
    });
  });

  describe('createHistory', () => {
    it('should create history entry', async () => {
      const history = {
        id: 'history-123',
        disputeId: 'dispute-123',
        action: 'created',
        performedBy: 'user-123',
        performedAt: new Date('2024-01-01'),
        metadata: JSON.stringify({ title: 'Test Dispute' }),
      };
      mockDb.returning.mockResolvedValue([history]);

      const result = await disputeRepository.createHistory({
        disputeId: 'dispute-123',
        action: 'created',
        performedBy: 'user-123',
        metadata: JSON.stringify({ title: 'Test Dispute' }),
      });

      expect(result).toEqual(history);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });
});
