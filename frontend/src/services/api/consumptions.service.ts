import { apiClient } from './client';
import type {
  PoolConsumption,
  CreateConsumptionDto,
  UpdateConsumptionDto,
  LinkToReportDto,
  ConsumptionsListResponse,
} from '@/types/consumption.types';

class ConsumptionsService {
  private basePath(communityId: string, councilId: string) {
    return `/api/v1/communities/${communityId}/councils/${councilId}/consumptions`;
  }

  /**
   * List consumptions for a council
   */
  async listConsumptions(
    communityId: string,
    councilId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ConsumptionsListResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    const qs = search.toString();
    return apiClient.get(`${this.basePath(communityId, councilId)}${qs ? `?${qs}` : ''}`);
  }

  /**
   * List consumptions not linked to any report
   */
  async listUnreportedConsumptions(
    communityId: string,
    councilId: string
  ): Promise<ConsumptionsListResponse> {
    return apiClient.get(`${this.basePath(communityId, councilId)}/unreported`);
  }

  /**
   * Get a single consumption
   */
  async getConsumption(
    communityId: string,
    councilId: string,
    consumptionId: string
  ): Promise<PoolConsumption> {
    return apiClient.get(`${this.basePath(communityId, councilId)}/${consumptionId}`);
  }

  /**
   * Create a new consumption
   */
  async createConsumption(
    communityId: string,
    councilId: string,
    dto: CreateConsumptionDto
  ): Promise<PoolConsumption> {
    return apiClient.post(this.basePath(communityId, councilId), dto);
  }

  /**
   * Update a consumption
   */
  async updateConsumption(
    communityId: string,
    councilId: string,
    consumptionId: string,
    dto: UpdateConsumptionDto
  ): Promise<PoolConsumption> {
    return apiClient.patch(`${this.basePath(communityId, councilId)}/${consumptionId}`, dto);
  }

  /**
   * Delete a consumption (restores inventory)
   */
  async deleteConsumption(
    communityId: string,
    councilId: string,
    consumptionId: string
  ): Promise<void> {
    return apiClient.delete(`${this.basePath(communityId, councilId)}/${consumptionId}`);
  }

  /**
   * Link multiple consumptions to a report
   */
  async linkToReport(
    communityId: string,
    councilId: string,
    dto: LinkToReportDto
  ): Promise<{ linked: number }> {
    return apiClient.post(`${this.basePath(communityId, councilId)}/link-to-report`, dto);
  }
}

export const consumptionsService = new ConsumptionsService();
