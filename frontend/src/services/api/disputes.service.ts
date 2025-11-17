/**
 * Disputes Service
 * Location per architecture: /services/api (API client & endpoints)
 */

import { apiClient } from './client';
import type {
  Dispute,
  DisputeDetail,
  DisputeListItem,
  DisputesListResponse,
  CreateDisputeDto,
  AddDisputeParticipantDto,
  CreateMediatorProposalDto,
  RespondToMediatorDto,
  CreateDisputeResolutionDto,
  CreateDisputeMessageDto,
  UpdateDisputeStatusDto,
  UpdateDisputePrivacyDto,
  DisputeMessagesResponse,
  DisputeStatus,
} from '@/types/dispute.types';

class DisputesService {
  private readonly basePath = '/api/v1/communities';

  /**
   * List disputes in a community
   */
  async listDisputes(
    communityId: string,
    params?: { status?: DisputeStatus }
  ): Promise<DisputesListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const url = `${this.basePath}/${communityId}/disputes${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url);
  }

  /**
   * Get dispute details
   */
  async getDispute(communityId: string, disputeId: string): Promise<DisputeDetail> {
    return apiClient.get(`${this.basePath}/${communityId}/disputes/${disputeId}`);
  }

  /**
   * Create a new dispute
   */
  async createDispute(communityId: string, dto: CreateDisputeDto): Promise<Dispute> {
    return apiClient.post(`${this.basePath}/${communityId}/disputes`, dto);
  }

  /**
   * Add a participant to a dispute
   */
  async addParticipant(
    communityId: string,
    disputeId: string,
    dto: AddDisputeParticipantDto
  ): Promise<void> {
    return apiClient.post(
      `${this.basePath}/${communityId}/disputes/${disputeId}/participants`,
      dto
    );
  }

  /**
   * Propose yourself as a mediator
   */
  async proposeAsMediator(
    communityId: string,
    disputeId: string
  ): Promise<void> {
    return apiClient.post(
      `${this.basePath}/${communityId}/disputes/${disputeId}/mediators`,
      {}
    );
  }

  /**
   * Respond to a mediator proposal (accept/reject)
   */
  async respondToMediator(
    communityId: string,
    disputeId: string,
    mediatorId: string,
    dto: RespondToMediatorDto
  ): Promise<void> {
    return apiClient.put(
      `${this.basePath}/${communityId}/disputes/${disputeId}/mediators/${mediatorId}`,
      dto
    );
  }

  /**
   * Create a resolution for a dispute
   */
  async createResolution(
    communityId: string,
    disputeId: string,
    dto: CreateDisputeResolutionDto
  ): Promise<DisputeDetail> {
    return apiClient.post(
      `${this.basePath}/${communityId}/disputes/${disputeId}/resolutions`,
      dto
    );
  }

  /**
   * List messages in a dispute
   */
  async listMessages(
    communityId: string,
    disputeId: string
  ): Promise<DisputeMessagesResponse> {
    return apiClient.get(
      `${this.basePath}/${communityId}/disputes/${disputeId}/messages`
    );
  }

  /**
   * Create a message in a dispute
   */
  async createMessage(
    communityId: string,
    disputeId: string,
    dto: CreateDisputeMessageDto
  ): Promise<void> {
    return apiClient.post(
      `${this.basePath}/${communityId}/disputes/${disputeId}/messages`,
      dto
    );
  }

  /**
   * Update dispute status
   */
  async updateStatus(
    communityId: string,
    disputeId: string,
    dto: UpdateDisputeStatusDto
  ): Promise<DisputeDetail> {
    return apiClient.put(
      `${this.basePath}/${communityId}/disputes/${disputeId}/status`,
      dto
    );
  }

  /**
   * Update dispute privacy type
   */
  async updatePrivacy(
    communityId: string,
    disputeId: string,
    dto: UpdateDisputePrivacyDto
  ): Promise<void> {
    return apiClient.put(
      `${this.basePath}/${communityId}/disputes/${disputeId}/privacy`,
      dto
    );
  }
}

export const disputesService = new DisputesService();
