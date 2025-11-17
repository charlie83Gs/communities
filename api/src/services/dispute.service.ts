import { disputeRepository, DisputeRepository } from '../repositories/dispute.repository';
import { communityRepository } from '../repositories/community.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class DisputeService {
  private disputeRepo: DisputeRepository;

  constructor(disputeRepo: DisputeRepository = disputeRepository) {
    this.disputeRepo = disputeRepo;
  }

  /**
   * Create a new dispute
   */
  async createDispute(
    communityId: string,
    userId: string,
    data: {
      title: string;
      description: string;
      participantIds?: string[];
      privacyType?: 'anonymous' | 'open';
    }
  ) {
    // Verify community exists
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if user can create disputes (permission includes trust threshold automatically)
    const canCreate = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_create_dispute'
    );

    if (!canCreate) {
      throw new AppError('You do not have permission to create disputes in this community', 403);
    }

    // Create dispute
    const dispute = await this.disputeRepo.createDispute({
      communityId,
      title: data.title,
      description: data.description,
      createdBy: userId,
      privacyType: data.privacyType ?? 'open',
    });

    // Add creator as initiator
    await this.disputeRepo.addParticipant({
      disputeId: dispute.id,
      userId,
      role: 'initiator',
      addedBy: userId,
    });

    // Add additional participants if provided
    if (data.participantIds && data.participantIds.length > 0) {
      for (const participantId of data.participantIds) {
        // Verify participant is a community member
        const isMember = await communityMemberRepository.isMember(communityId, participantId);
        if (!isMember) {
          logger.warn('Skipping non-member participant', { participantId, disputeId: dispute.id });
          continue;
        }

        await this.disputeRepo.addParticipant({
          disputeId: dispute.id,
          userId: participantId,
          role: 'participant',
          addedBy: userId,
        });
      }
    }

    // Log history
    await this.disputeRepo.createHistory({
      disputeId: dispute.id,
      action: 'created',
      performedBy: userId,
      metadata: JSON.stringify({ title: data.title }),
    });

    logger.info('Dispute created', { disputeId: dispute.id, communityId, userId });
    return dispute;
  }

  /**
   * Get dispute details with authorization check
   */
  async getDisputeById(disputeId: string, userId: string) {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Check if user has access to view this dispute
    const hasAccess = await this.canAccessDisputeDetails(disputeId, userId, dispute.communityId);
    if (!hasAccess) {
      throw new AppError('You do not have permission to view this dispute', 403);
    }

    // Get additional details
    const participants = await this.disputeRepo.findParticipantsByDispute(disputeId);
    const mediators = await this.disputeRepo.findMediatorsByDispute(disputeId);
    const resolutions = await this.disputeRepo.findResolutionsByDispute(disputeId);

    // Check user's capabilities
    const isParticipant = await this.disputeRepo.isParticipant(disputeId, userId);
    const isAcceptedMediator = await this.disputeRepo.isAcceptedMediator(disputeId, userId);
    const isAdmin = await openFGAService.checkAccess(
      userId,
      'community',
      dispute.communityId,
      'admin'
    );
    const canProposeAsMediator = await openFGAService.checkAccess(
      userId,
      'community',
      dispute.communityId,
      'can_handle_dispute'
    );

    // Determine if user can see identities (for anonymous disputes)
    const canSeeIdentities =
      dispute.privacyType === 'open' || isAcceptedMediator || isAdmin || isParticipant;

    // Anonymize participants and mediators if needed
    const processedParticipants = participants.map((p) => ({
      ...p,
      user: canSeeIdentities
        ? p.user
        : { id: 'anonymous', username: 'anonymous', displayName: 'Anonymous' },
    }));

    const processedMediators = mediators.map((m) => ({
      ...m,
      user: canSeeIdentities
        ? m.user
        : { id: 'anonymous', username: 'anonymous', displayName: 'Anonymous' },
    }));

    return {
      ...dispute,
      participants: processedParticipants,
      mediators: processedMediators,
      resolutions,
      isParticipant,
      isAcceptedMediator,
      canProposeAsMediator,
      canAcceptMediator: isParticipant,
      canCreateResolution: isAcceptedMediator,
      canViewResolution: true, // If user can see the dispute, they can see open resolutions
      canUpdatePrivacy: isAdmin || isAcceptedMediator,
    };
  }

  /**
   * List disputes visible to user
   */
  async listDisputes(
    communityId: string,
    userId: string,
    options: { page?: number; limit?: number; status?: string } = {}
  ) {
    const { page = 0, limit = 20, status } = options;
    const offset = page * limit;

    // Check if user can view dispute titles
    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_dispute'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view disputes', 403);
    }

    // Get all disputes in community
    const { disputes, total } = await this.disputeRepo.findDisputesByCommunity(communityId, {
      limit,
      offset,
      status,
    });

    // Filter to disputes user can see details of
    const accessibleDisputes = [];
    for (const dispute of disputes) {
      const hasAccess = await this.canAccessDisputeDetails(dispute.id, userId, dispute.communityId);
      if (hasAccess) {
        // Include full details
        accessibleDisputes.push(dispute);
      } else {
        // Only include title and status for disputes user can't access
        accessibleDisputes.push({
          id: dispute.id,
          title: dispute.title,
          status: dispute.status,
          createdAt: dispute.createdAt,
        });
      }
    }

    return { disputes: accessibleDisputes, total };
  }

  /**
   * Add participant to dispute
   */
  async addParticipant(disputeId: string, participantId: string, addedBy: string) {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Only existing participants or admins can add new participants
    const isParticipant = await this.disputeRepo.isParticipant(disputeId, addedBy);
    const isAdmin = await openFGAService.checkAccess(
      addedBy,
      'community',
      dispute.communityId,
      'admin'
    );

    if (!isParticipant && !isAdmin) {
      throw new AppError('Only participants or admins can add new participants', 403);
    }

    // Check if already a participant
    const existing = await this.disputeRepo.findParticipant(disputeId, participantId);
    if (existing) {
      throw new AppError('User is already a participant', 400);
    }

    // Add participant
    await this.disputeRepo.addParticipant({
      disputeId,
      userId: participantId,
      role: 'participant',
      addedBy,
    });

    // Log history
    await this.disputeRepo.createHistory({
      disputeId,
      action: 'participant_added',
      performedBy: addedBy,
      metadata: JSON.stringify({ participantId }),
    });

    logger.info('Participant added to dispute', { disputeId, participantId, addedBy });
  }

  /**
   * Propose as mediator
   */
  async proposeAsMediator(disputeId: string, userId: string) {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Check if user can see dispute titles and propose mediation
    const canHandle = await openFGAService.checkAccess(
      userId,
      'community',
      dispute.communityId,
      'can_handle_dispute'
    );

    if (!canHandle) {
      throw new AppError('You do not have permission to mediate disputes', 403);
    }

    // Check if already proposed
    const existing = await this.disputeRepo.findMediatorProposal(disputeId, userId);
    if (existing) {
      throw new AppError('You have already proposed to mediate this dispute', 400);
    }

    // Propose as mediator
    const mediator = await this.disputeRepo.proposeMediator({ disputeId, userId });

    // Log history
    await this.disputeRepo.createHistory({
      disputeId,
      action: 'mediator_proposed',
      performedBy: userId,
      metadata: JSON.stringify({ mediatorId: mediator.id }),
    });

    logger.info('Mediator proposed', { disputeId, userId });
    return mediator;
  }

  /**
   * Accept or reject mediator proposal
   */
  async respondToMediatorProposal(mediatorId: string, userId: string, accept: boolean) {
    const mediator = await this.disputeRepo.findMediatorById(mediatorId);
    if (!mediator) {
      throw new AppError('Mediator proposal not found', 404);
    }

    const dispute = await this.disputeRepo.findDisputeById(mediator.disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Only participants can accept/reject mediators
    const isParticipant = await this.disputeRepo.isParticipant(mediator.disputeId, userId);
    if (!isParticipant) {
      throw new AppError('Only participants can respond to mediator proposals', 403);
    }

    // Check if already responded
    if (mediator.status !== 'proposed') {
      throw new AppError('This mediator proposal has already been responded to', 400);
    }

    // Update mediator status
    const updatedMediator = await this.disputeRepo.updateMediatorStatus(mediatorId, {
      mediatorId,
      status: accept ? 'accepted' : 'rejected',
      respondedBy: userId,
    });

    // Update dispute status if this is the first accepted mediator
    if (accept && dispute.status === 'open') {
      await this.disputeRepo.updateDispute(dispute.id, { status: 'in_mediation' });
    }

    // Log history
    await this.disputeRepo.createHistory({
      disputeId: mediator.disputeId,
      action: accept ? 'mediator_accepted' : 'mediator_rejected',
      performedBy: userId,
      metadata: JSON.stringify({ mediatorId, mediatorUserId: mediator.userId }),
    });

    logger.info('Mediator proposal responded to', {
      mediatorId,
      accepted: accept,
      respondedBy: userId,
    });

    return updatedMediator;
  }

  /**
   * Create resolution (mediator only)
   */
  async createResolution(
    disputeId: string,
    userId: string,
    data: {
      resolutionType: 'open' | 'closed';
      resolution: string;
    }
  ) {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Only accepted mediators can create resolutions
    const isMediator = await this.disputeRepo.isAcceptedMediator(disputeId, userId);
    if (!isMediator) {
      throw new AppError('Only accepted mediators can create resolutions', 403);
    }

    // Check if open resolutions are allowed
    if (data.resolutionType === 'open') {
      const community = await communityRepository.findById(dispute.communityId);
      const allowOpenResolutions = community?.allowOpenResolutions ?? true;
      if (!allowOpenResolutions) {
        throw new AppError('Open resolutions are not allowed in this community', 400);
      }
    }

    // Create resolution
    const resolution = await this.disputeRepo.createResolution({
      disputeId,
      resolutionType: data.resolutionType,
      resolution: data.resolution,
      createdBy: userId,
      isPublic: data.resolutionType === 'open',
    });

    // Update dispute status
    await this.disputeRepo.updateDispute(disputeId, {
      status: 'resolved',
      resolvedAt: new Date(),
    });

    // Log history
    await this.disputeRepo.createHistory({
      disputeId,
      action: 'resolution_created',
      performedBy: userId,
      metadata: JSON.stringify({ resolutionId: resolution.id, type: data.resolutionType }),
    });

    logger.info('Resolution created', { disputeId, resolutionId: resolution.id, userId });
    return resolution;
  }

  /**
   * Add message to dispute
   */
  async addMessage(
    disputeId: string,
    userId: string,
    data: {
      message: string;
      visibleToParticipants?: boolean;
      visibleToMediators?: boolean;
    }
  ) {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Check if user has access to dispute
    const hasAccess = await this.canAccessDisputeDetails(disputeId, userId, dispute.communityId);
    if (!hasAccess) {
      throw new AppError('You do not have permission to add messages to this dispute', 403);
    }

    // Create message
    const message = await this.disputeRepo.createMessage({
      disputeId,
      userId,
      message: data.message,
      visibleToParticipants: data.visibleToParticipants ?? true,
      visibleToMediators: data.visibleToMediators ?? true,
    });

    logger.info('Message added to dispute', { disputeId, messageId: message.id, userId });
    return message;
  }

  /**
   * Get messages for dispute
   */
  async getMessages(
    disputeId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const { page = 0, limit = 50 } = options;
    const offset = page * limit;

    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Check if user has access to dispute
    const hasAccess = await this.canAccessDisputeDetails(disputeId, userId, dispute.communityId);
    if (!hasAccess) {
      throw new AppError('You do not have permission to view messages for this dispute', 403);
    }

    // Get messages
    const { messages, total } = await this.disputeRepo.findMessagesByDispute(disputeId, {
      limit,
      offset,
    });

    // Filter messages based on visibility and user role
    const isParticipant = await this.disputeRepo.isParticipant(disputeId, userId);
    const isMediator = await this.disputeRepo.isAcceptedMediator(disputeId, userId);
    const isAdmin = await openFGAService.checkAccess(
      userId,
      'community',
      dispute.communityId,
      'admin'
    );

    // Determine if user can see identities (for anonymous disputes)
    const canSeeIdentities =
      dispute.privacyType === 'open' || isMediator || isAdmin || isParticipant;

    // Filter and anonymize messages
    const filteredMessages = messages
      .filter((msg) => {
        if (isParticipant && msg.visibleToParticipants) return true;
        if (isMediator && msg.visibleToMediators) return true;
        return false;
      })
      .map((msg) => ({
        ...msg,
        user: canSeeIdentities
          ? msg.user
          : { id: 'anonymous', username: 'anonymous', displayName: 'Anonymous' },
      }));

    return { messages: filteredMessages, total };
  }

  /**
   * Update dispute status
   */
  async updateDisputeStatus(
    disputeId: string,
    userId: string,
    status: 'open' | 'in_mediation' | 'resolved' | 'closed'
  ) {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Only participants, mediators, or admins can update status
    const isParticipant = await this.disputeRepo.isParticipant(disputeId, userId);
    const isMediator = await this.disputeRepo.isAcceptedMediator(disputeId, userId);
    const isAdmin = await openFGAService.checkAccess(
      userId,
      'community',
      dispute.communityId,
      'admin'
    );

    if (!isParticipant && !isMediator && !isAdmin) {
      throw new AppError('You do not have permission to update dispute status', 403);
    }

    // Update status
    const updated = await this.disputeRepo.updateDispute(disputeId, { status });

    // Log history
    await this.disputeRepo.createHistory({
      disputeId,
      action: 'status_updated',
      performedBy: userId,
      metadata: JSON.stringify({ oldStatus: dispute.status, newStatus: status }),
    });

    logger.info('Dispute status updated', {
      disputeId,
      oldStatus: dispute.status,
      newStatus: status,
      userId,
    });
    return updated;
  }

  /**
   * Update dispute privacy type
   */
  async updateDisputePrivacy(disputeId: string, userId: string, privacyType: 'anonymous' | 'open') {
    const dispute = await this.disputeRepo.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }

    // Only mediators or admins can update privacy
    const isMediator = await this.disputeRepo.isAcceptedMediator(disputeId, userId);
    const isAdmin = await openFGAService.checkAccess(
      userId,
      'community',
      dispute.communityId,
      'admin'
    );

    if (!isMediator && !isAdmin) {
      throw new AppError('You do not have permission to update dispute privacy', 403);
    }

    // Update privacy type
    const updated = await this.disputeRepo.updateDispute(disputeId, { privacyType });

    // Log history
    await this.disputeRepo.createHistory({
      disputeId,
      action: 'privacy_updated',
      performedBy: userId,
      metadata: JSON.stringify({ oldPrivacy: dispute.privacyType, newPrivacy: privacyType }),
    });

    logger.info('Dispute privacy updated', {
      disputeId,
      oldPrivacy: dispute.privacyType,
      newPrivacy: privacyType,
      userId,
    });
    return updated;
  }

  /**
   * Helper: Check if user can access dispute details
   */
  private async canAccessDisputeDetails(
    disputeId: string,
    userId: string,
    communityId: string
  ): Promise<boolean> {
    logger.info('[Dispute Access Check]', { disputeId, userId, communityId });

    // Admins can always access
    const isAdmin = await openFGAService.checkAccess(userId, 'community', communityId, 'admin');
    logger.info('[Dispute Access Check] Admin check', { isAdmin });
    if (isAdmin) return true;

    // Participants can access
    const isParticipant = await this.disputeRepo.isParticipant(disputeId, userId);
    logger.info('[Dispute Access Check] Participant check', { isParticipant });
    if (isParticipant) return true;

    // Accepted mediators can access
    const isMediator = await this.disputeRepo.isAcceptedMediator(disputeId, userId);
    logger.info('[Dispute Access Check] Mediator check', { isMediator });
    if (isMediator) return true;

    logger.warn('[Dispute Access Check] Access denied', { disputeId, userId });
    return false;
  }
}

export const disputeService = new DisputeService();
