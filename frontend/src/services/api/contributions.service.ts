import { apiClient } from './client';
import type {
  RecognizedContribution,
  LogContributionDto,
  VerifyContributionDto,
  DisputeContributionDto,
  ContributionProfile,
  PeerRecognitionGrant,
  GrantPeerRecognitionDto,
  PeerRecognitionLimits,
  ValueCalibrationHistory,
  PendingVerification,
} from '@/types/contributions.types';

export class ContributionsService {
  private readonly basePath = '/api/v1/communities';

  // ========== Contributions ==========

  async logContribution(
    communityId: string,
    data: LogContributionDto
  ): Promise<RecognizedContribution> {
    const url = `${this.basePath}/${communityId}/contributions`;
    return apiClient.post(url, data);
  }

  async getContribution(
    communityId: string,
    contributionId: string
  ): Promise<RecognizedContribution> {
    const url = `${this.basePath}/${communityId}/contributions/${contributionId}`;
    return apiClient.get(url);
  }

  async verifyContribution(
    communityId: string,
    contributionId: string,
    data: VerifyContributionDto
  ): Promise<RecognizedContribution> {
    const url = `${this.basePath}/${communityId}/contributions/${contributionId}/verify`;
    return apiClient.post(url, data);
  }

  async disputeContribution(
    communityId: string,
    contributionId: string,
    data: DisputeContributionDto
  ): Promise<RecognizedContribution> {
    const url = `${this.basePath}/${communityId}/contributions/${contributionId}/dispute`;
    return apiClient.post(url, data);
  }

  async getMyContributions(
    communityId: string,
    page?: number,
    limit?: number
  ): Promise<RecognizedContribution[]> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const url = `${this.basePath}/${communityId}/contributions/my?${params.toString()}`;
    return apiClient.get(url);
  }

  async getContributionProfile(
    communityId: string,
    userId: string
  ): Promise<ContributionProfile> {
    const url = `${this.basePath}/${communityId}/contributions/profile/${userId}`;
    return apiClient.get(url);
  }

  async getMyProfile(communityId: string): Promise<ContributionProfile> {
    const url = `${this.basePath}/${communityId}/contributions/profile/me`;
    return apiClient.get(url);
  }

  // ========== Peer Recognition ==========

  async grantPeerRecognition(
    communityId: string,
    data: GrantPeerRecognitionDto
  ): Promise<PeerRecognitionGrant> {
    const url = `${this.basePath}/${communityId}/peer-recognition`;
    return apiClient.post(url, data);
  }

  async getMyPeerGrants(
    communityId: string,
    monthYear?: string
  ): Promise<PeerRecognitionGrant[]> {
    const params = new URLSearchParams();
    if (monthYear) params.append('monthYear', monthYear);

    const url = `${this.basePath}/${communityId}/peer-recognition/my?${params.toString()}`;
    return apiClient.get(url);
  }

  async getMyPeerRecognition(
    communityId: string,
    limit?: number
  ): Promise<{
    given: Array<{
      id: string;
      communityId: string;
      fromUserId: string;
      toUserId: string;
      toUserName: string;
      valueUnits: number;
      description: string;
      createdAt: string;
    }>;
    received: Array<{
      id: string;
      communityId: string;
      fromUserId: string;
      fromUserName: string;
      toUserId: string;
      valueUnits: number;
      description: string;
      createdAt: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const url = `${this.basePath}/${communityId}/peer-recognition/my?${params.toString()}`;
    return apiClient.get(url);
  }

  async getPeerRecognitionLimits(communityId: string): Promise<PeerRecognitionLimits> {
    const url = `${this.basePath}/${communityId}/peer-recognition/limits`;
    return apiClient.get(url);
  }

  // ========== Verification Queue ==========

  async getPendingVerifications(communityId: string): Promise<PendingVerification[]> {
    const url = `${this.basePath}/${communityId}/contributions/pending-verifications`;
    return apiClient.get(url);
  }

  // ========== Calibration History ==========

  async getCalibrationHistory(
    communityId: string,
    itemId?: string
  ): Promise<ValueCalibrationHistory[]> {
    const params = new URLSearchParams();
    if (itemId) params.append('itemId', itemId);

    const url = `${this.basePath}/${communityId}/value-calibration-history?${params.toString()}`;
    return apiClient.get(url);
  }
}

export const contributionsService = new ContributionsService();
