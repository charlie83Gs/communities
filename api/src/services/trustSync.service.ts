/**
 * Trust Score Synchronization Service
 *
 * This service synchronizes trust scores from the database to OpenFGA relationships.
 * Trust scores are modeled as trust_level_X relations in OpenFGA for efficient
 * threshold-based authorization checks.
 *
 * Key Responsibilities:
 * - Sync individual user trust scores to OpenFGA trust_level relations
 * - Sync council trust scores to OpenFGA
 * - Handle trust score updates (remove old level, add new level)
 * - Batch sync operations for performance
 */

import { openFGAService } from './openfga.service';
import { trustViewRepository } from '@/repositories/trustView.repository';
import logger from '@/utils/logger';

export class TrustSyncService {
  /**
   * Sync a single user's trust score to OpenFGA
   *
   * Updates the user's trust_level_X relation in the community.
   * Removes the old trust level and adds the new one.
   *
   * @param communityId - Community ID
   * @param userId - User ID
   * @param newTrustScore - New trust score (0-100)
   * @param oldTrustScore - Previous trust score (optional, for cleanup)
   */
  async syncUserTrustScore(
    communityId: string,
    userId: string,
    newTrustScore: number,
    oldTrustScore?: number
  ): Promise<void> {
    try {
      // Clamp trust score to 0-100
      const clampedScore = Math.max(0, Math.min(100, Math.floor(newTrustScore)));

      const writes: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [];

      const deletes: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [];

      // Remove old trust level if provided
      if (oldTrustScore !== undefined && oldTrustScore !== newTrustScore) {
        const oldClamped = Math.max(0, Math.min(100, Math.floor(oldTrustScore)));
        deletes.push({
          user: `user:${userId}`,
          relation: `trust_level_${oldClamped}`,
          object: `community:${communityId}`,
        });
      }

      // Add new trust level
      writes.push({
        user: `user:${userId}`,
        relation: `trust_level_${clampedScore}`,
        object: `community:${communityId}`,
      });

      // Execute batch write
      await openFGAService.batchWrite(writes, deletes);

      logger.debug(
        `[TrustSync] Synced trust score for user ${userId} in community ${communityId}: ${clampedScore}`
      );
    } catch (error) {
      logger.error(
        `[TrustSync] Failed to sync trust score for user ${userId} in community ${communityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Sync all user trust scores for a community
   *
   * Fetches all trust scores from the database and syncs them to OpenFGA.
   * Useful for initial setup or full resync.
   *
   * @param communityId - Community ID
   */
  async syncCommunityTrustScores(communityId: string): Promise<void> {
    try {
      logger.info(`[TrustSync] Starting full sync for community ${communityId}`);

      // Fetch all trust views for the community
      const trustViews = await trustViewRepository.getAllForCommunity(communityId);

      const writes: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [];

      for (const trustView of trustViews) {
        const clampedScore = Math.max(0, Math.min(100, Math.floor(trustView.points)));
        writes.push({
          user: `user:${trustView.userId}`,
          relation: `trust_level_${clampedScore}`,
          object: `community:${communityId}`,
        });
      }

      // Clear existing trust levels for this community (cleanup)
      await this.clearCommunityTrustLevels(communityId);

      // Batch write all trust levels
      await openFGAService.batchWrite(writes, []);

      logger.info(
        `[TrustSync] Completed full sync for community ${communityId}: ${trustViews.length} users`
      );
    } catch (error) {
      logger.error(`[TrustSync] Failed to sync community ${communityId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all trust level relations for a community
   *
   * Removes all trust_level_X relations from the community object.
   * Used before full resync to ensure clean state.
   *
   * @param communityId - Community ID
   */
  private async clearCommunityTrustLevels(communityId: string): Promise<void> {
    try {
      const deletes: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [];

      // Read all trust level tuples for this community
      for (let level = 0; level <= 100; level++) {
        const tuples = await openFGAService.readTuples({
          object: `community:${communityId}`,
          relation: `trust_level_${level}`,
        });

        for (const tuple of tuples) {
          if (tuple.key.user) {
            deletes.push({
              user: tuple.key.user,
              relation: `trust_level_${level}`,
              object: `community:${communityId}`,
            });
          }
        }
      }

      if (deletes.length > 0) {
        await openFGAService.batchWrite([], deletes);
        logger.debug(
          `[TrustSync] Cleared ${deletes.length} trust level relations for community ${communityId}`
        );
      }
    } catch (error) {
      logger.warn(`[TrustSync] Failed to clear trust levels for community ${communityId}:`, error);
      // Non-fatal, continue
    }
  }

  /**
   * Check if user has sufficient trust level
   *
   * Checks if user has trust_level_X where X >= requiredLevel.
   * This is the core method for trust-based authorization.
   *
   * @param communityId - Community ID
   * @param userId - User ID
   * @param requiredLevel - Minimum required trust level
   * @returns true if user has sufficient trust
   */
  async hasSufficientTrust(
    communityId: string,
    userId: string,
    requiredLevel: number
  ): Promise<boolean> {
    try {
      const clampedRequired = Math.max(0, Math.min(100, Math.floor(requiredLevel)));

      // Check if user has trust_level relation >= required level
      // We check the exact level and all higher levels
      for (let level = clampedRequired; level <= 100; level++) {
        const hasLevel = await openFGAService.check({
          user: `user:${userId}`,
          relation: `trust_level_${level}`,
          object: `community:${communityId}`,
        });

        if (hasLevel) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(
        `[TrustSync] Failed to check trust level for user ${userId} in community ${communityId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get user's current trust level from OpenFGA
   *
   * Finds the highest trust_level_X relation the user has.
   *
   * @param communityId - Community ID
   * @param userId - User ID
   * @returns Trust level (0-100) or null if not found
   */
  async getUserTrustLevel(communityId: string, userId: string): Promise<number | null> {
    try {
      // Check from highest to lowest to find the user's trust level
      for (let level = 100; level >= 0; level--) {
        const hasLevel = await openFGAService.check({
          user: `user:${userId}`,
          relation: `trust_level_${level}`,
          object: `community:${communityId}`,
        });

        if (hasLevel) {
          return level;
        }
      }

      return null;
    } catch (error) {
      logger.error(
        `[TrustSync] Failed to get trust level for user ${userId} in community ${communityId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Sync council trust score to OpenFGA
   *
   * Similar to user trust sync but for councils.
   *
   * @param communityId - Community ID
   * @param councilId - Council ID
   * @param newTrustScore - New trust score
   * @param oldTrustScore - Previous trust score (optional)
   */
  async syncCouncilTrustScore(
    communityId: string,
    councilId: string,
    newTrustScore: number,
    oldTrustScore?: number
  ): Promise<void> {
    try {
      // Round to nearest 5 for councils (to reduce relation count)
      const clampedScore = Math.max(0, Math.min(100, Math.round(newTrustScore / 5) * 5));

      const writes: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [];

      const deletes: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [];

      // Remove old trust level if provided
      if (oldTrustScore !== undefined && oldTrustScore !== newTrustScore) {
        const oldClamped = Math.max(0, Math.min(100, Math.round(oldTrustScore / 5) * 5));
        deletes.push({
          user: `council:${councilId}`,
          relation: `trust_level_${oldClamped}`,
          object: `community:${communityId}`,
        });
      }

      // Add new trust level
      writes.push({
        user: `council:${councilId}`,
        relation: `trust_level_${clampedScore}`,
        object: `community:${communityId}`,
      });

      // Also assign to parent community for council-specific checks
      const councilWrites: Array<{
        user: string;
        relation: string;
        object: string;
      }> = [{
        user: `council:${councilId}`,
        relation: `trust_level_${clampedScore}`,
        object: `council:${councilId}`,
      }];

      await openFGAService.batchWrite([...writes, ...councilWrites], deletes);

      logger.debug(
        `[TrustSync] Synced council trust score for ${councilId} in community ${communityId}: ${clampedScore}`
      );
    } catch (error) {
      logger.error(
        `[TrustSync] Failed to sync council trust score for ${councilId}:`,
        error
      );
      throw error;
    }
  }
}

export const trustSyncService = new TrustSyncService();
