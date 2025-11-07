import { trustLevelRepository } from '../repositories/trustLevel.repository';
import { communityRepository } from '../repositories/community.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { AppError } from '../utils/errors';
import { CreateTrustLevelDto, UpdateTrustLevelDto, TrustLevel } from '../types/trustLevel.types';
import { resolveTrustRequirementDetailed } from '../utils/trustResolver';
import logger from '../utils/logger';

export class TrustLevelService {
  async createTrustLevel(
    communityId: string,
    data: CreateTrustLevelDto,
    userId: string
  ): Promise<TrustLevel> {
    logger.info(
      `[TrustLevelService createTrustLevel] Creating trust level for community: ${communityId}`
    );

    // Verify community exists
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check admin permission
    const isAdmin = await communityMemberRepository.isAdmin(communityId, userId);
    if (!isAdmin) {
      throw new AppError('Only admins can create trust levels', 403);
    }

    // Validate threshold is non-negative
    if (data.threshold < 0) {
      throw new AppError('Threshold must be non-negative', 400);
    }

    // Check if name already exists in this community
    const existing = await trustLevelRepository.findByName(communityId, data.name);
    if (existing) {
      throw new AppError('A trust level with this name already exists in this community', 400);
    }

    const trustLevel = await trustLevelRepository.create(communityId, data);
    logger.info(
      `[TrustLevelService createTrustLevel] Trust level created with id: ${trustLevel.id}`
    );

    return trustLevel;
  }

  async getTrustLevel(levelId: string, userId: string): Promise<TrustLevel> {
    logger.debug(`[TrustLevelService getTrustLevel] Fetching trust level: ${levelId}`);

    const trustLevel = await trustLevelRepository.findById(levelId);
    if (!trustLevel) {
      throw new AppError('Trust level not found', 404);
    }

    // Verify user has access to the community
    const role = await communityMemberRepository.getUserRole(trustLevel.communityId, userId);
    if (!role) {
      throw new AppError('Forbidden: no access to this community', 403);
    }

    return trustLevel;
  }

  async listTrustLevels(communityId: string, userId: string): Promise<TrustLevel[]> {
    logger.debug(
      `[TrustLevelService listTrustLevels] Fetching trust levels for community: ${communityId}`
    );

    // Verify community exists
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Verify user has access to the community
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role) {
      throw new AppError('Forbidden: no access to this community', 403);
    }

    const trustLevels = await trustLevelRepository.findByCommunityId(communityId);
    return trustLevels;
  }

  async updateTrustLevel(
    levelId: string,
    data: UpdateTrustLevelDto,
    userId: string
  ): Promise<TrustLevel> {
    logger.info(`[TrustLevelService updateTrustLevel] Updating trust level: ${levelId}`);

    const trustLevel = await trustLevelRepository.findById(levelId);
    if (!trustLevel) {
      throw new AppError('Trust level not found', 404);
    }

    // Check admin permission
    const isAdmin = await communityMemberRepository.isAdmin(trustLevel.communityId, userId);
    if (!isAdmin) {
      throw new AppError('Only admins can update trust levels', 403);
    }

    // Validate threshold if provided
    if (data.threshold !== undefined && data.threshold < 0) {
      throw new AppError('Threshold must be non-negative', 400);
    }

    // Check if new name conflicts with existing level
    if (data.name && data.name !== trustLevel.name) {
      const existing = await trustLevelRepository.findByName(trustLevel.communityId, data.name);
      if (existing) {
        throw new AppError('A trust level with this name already exists in this community', 400);
      }
    }

    const updated = await trustLevelRepository.update(levelId, data);
    if (!updated) {
      throw new AppError('Failed to update trust level', 500);
    }

    logger.info(`[TrustLevelService updateTrustLevel] Trust level updated: ${levelId}`);
    return updated;
  }

  async deleteTrustLevel(levelId: string, userId: string): Promise<void> {
    logger.info(`[TrustLevelService deleteTrustLevel] Deleting trust level: ${levelId}`);

    const trustLevel = await trustLevelRepository.findById(levelId);
    if (!trustLevel) {
      throw new AppError('Trust level not found', 404);
    }

    // Check admin permission
    const isAdmin = await communityMemberRepository.isAdmin(trustLevel.communityId, userId);
    if (!isAdmin) {
      throw new AppError('Only admins can delete trust levels', 403);
    }

    // TODO: In a production system, we should check if this trust level is referenced
    // in any community configuration and prevent deletion or update references
    // For now, we'll allow deletion and let the resolver handle missing references

    await trustLevelRepository.delete(levelId);
    logger.info(`[TrustLevelService deleteTrustLevel] Trust level deleted: ${levelId}`);
  }

  async resolveTrustReference(
    communityId: string,
    reference: string,
    userId: string
  ): Promise<{ name: string; threshold: number }> {
    logger.debug(
      `[TrustLevelService resolveTrustReference] Resolving reference: ${reference} for community: ${communityId}`
    );

    // Verify community exists
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Verify user has access to the community
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role) {
      throw new AppError('Forbidden: no access to this community', 403);
    }

    // Resolve the reference
    const resolution = await resolveTrustRequirementDetailed(communityId, {
      type: 'level',
      value: reference,
    });

    return {
      name: resolution.levelName || reference,
      threshold: resolution.resolvedValue,
    };
  }

  async initializeDefaultLevels(communityId: string): Promise<TrustLevel[]> {
    logger.info(
      `[TrustLevelService initializeDefaultLevels] Initializing default trust levels for community: ${communityId}`
    );

    // Check if levels already exist
    const existing = await trustLevelRepository.findByCommunityId(communityId);
    if (existing.length > 0) {
      logger.warn(
        `[TrustLevelService initializeDefaultLevels] Community already has trust levels, skipping initialization`
      );
      return existing;
    }

    const defaultLevels = await trustLevelRepository.createDefaultLevels(communityId);
    logger.info(
      `[TrustLevelService initializeDefaultLevels] Created ${defaultLevels.length} default trust levels`
    );

    return defaultLevels;
  }
}

export const trustLevelService = new TrustLevelService();
