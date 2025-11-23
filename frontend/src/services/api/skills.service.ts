import { apiClient } from './client';
import type {
  GetUserSkillsResponse,
  CreateSkillDto,
  CreateSkillResponse,
  GetSkillSuggestionsResponse,
  EndorseSkillDto,
  EndorseSkillResponse,
} from '@/types/skills.types';

class SkillsService {
  private readonly basePath = '/api/v1';

  /**
   * Get user's skills with endorsement counts for a specific community
   */
  async getUserSkills(userId: string, communityId: string): Promise<GetUserSkillsResponse> {
    return apiClient.get(`${this.basePath}/users/${userId}/skills?communityId=${communityId}`);
  }

  /**
   * Create a new skill for the current user
   */
  async createSkill(data: CreateSkillDto): Promise<CreateSkillResponse> {
    return apiClient.post(`${this.basePath}/users/skills`, data);
  }

  /**
   * Delete a skill (soft delete)
   */
  async deleteSkill(skillId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/users/skills/${skillId}`);
  }

  /**
   * Get contextual skill suggestions for endorsement
   */
  async getSkillSuggestions(
    userId: string,
    communityId: string,
    itemId?: string
  ): Promise<GetSkillSuggestionsResponse> {
    const params = new URLSearchParams({ communityId });
    if (itemId) {
      params.append('itemId', itemId);
    }
    return apiClient.get(`${this.basePath}/skills/suggestions/${userId}?${params.toString()}`);
  }

  /**
   * Endorse a skill
   */
  async endorseSkill(skillId: string, data: EndorseSkillDto): Promise<EndorseSkillResponse> {
    return apiClient.post(`${this.basePath}/skills/${skillId}/endorse`, data);
  }

  /**
   * Remove endorsement
   */
  async removeEndorsement(skillId: string, communityId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/skills/${skillId}/endorse?communityId=${communityId}`);
  }
}

export const skillsService = new SkillsService();
