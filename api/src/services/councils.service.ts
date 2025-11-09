import { councilsRepository, Council } from '../repositories/councils.repository';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class CouncilsService {
  /**
   * Get councils managed by the current user in a community
   * @param communityId - The community ID
   * @param userId - The user ID
   * @returns Array of councils where user is a manager
   */
  async getManagedCouncils(communityId: string, userId: string): Promise<{ councils: Council[] }> {
    logger.debug(
      `[CouncilsService getManagedCouncils] Fetching managed councils for userId: ${userId} in community: ${communityId}`
    );

    try {
      const councils = await councilsRepository.getManagedCouncilsByUser(communityId, userId);

      logger.debug(
        `[CouncilsService getManagedCouncils] Found ${councils.length} managed councils for userId: ${userId}`
      );

      return { councils };
    } catch (error) {
      logger.error(
        `[CouncilsService getManagedCouncils] Error fetching managed councils for userId: ${userId} in community: ${communityId}`,
        error
      );
      throw new AppError('Failed to fetch managed councils', 500);
    }
  }
}

export const councilsService = new CouncilsService();
