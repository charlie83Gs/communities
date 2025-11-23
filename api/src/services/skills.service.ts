import { skillsRepository } from '@/repositories/skills.repository';
import { openFGAService } from '@/services/openfga.service';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';
import type {
  CreateSkillInput,
  SkillWithEndorsements,
  UserSkillsResponse,
  SkillSuggestionsResponse,
  CreateSkillResponse,
  EndorseSkillResponse,
} from '@/types/skills.types';

/**
 * Skills Service
 *
 * Business logic for skills and endorsements system (FT-19).
 * Handles authorization, validation, and orchestration.
 */
class SkillsService {
  /**
   * Get user's skills with endorsement counts for a community
   */
  async getUserSkills(
    userId: string,
    communityId: string,
    viewerId: string
  ): Promise<UserSkillsResponse> {
    try {
      const skills = await skillsRepository.getUserSkills(userId, communityId, viewerId);
      return { skills };
    } catch (err) {
      logger.error('Error fetching user skills', {
        userId,
        communityId,
        error: err,
      });
      throw new AppError('Failed to fetch user skills', 500);
    }
  }

  /**
   * Create a new skill for the current user
   * No permission check needed - users can always add their own skills
   */
  async createSkill(userId: string, data: CreateSkillInput): Promise<CreateSkillResponse> {
    try {
      // Validate skill name
      const trimmedName = data.name.trim();

      if (!trimmedName) {
        throw new AppError('Skill name cannot be empty', 400);
      }

      if (trimmedName.length > 50) {
        throw new AppError('Skill name must be 50 characters or less', 400);
      }

      // Validate allowed characters (alphanumeric + space/hyphen/ampersand)
      const validNameRegex = /^[a-zA-Z0-9\s\-&]+$/;
      if (!validNameRegex.test(trimmedName)) {
        throw new AppError(
          'Skill name can only contain letters, numbers, spaces, hyphens, and ampersands',
          400
        );
      }

      const skill = await skillsRepository.createSkill(userId, trimmedName);

      logger.info('Skill created', { skillId: skill.id, userId, name: trimmedName });

      return { skill };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      if (err instanceof Error && err.message === 'Skill already exists') {
        throw new AppError('You already have this skill', 409);
      }
      logger.error('Error creating skill', { userId, data, error: err });
      throw new AppError('Failed to create skill', 500);
    }
  }

  /**
   * Delete a skill (soft delete)
   * Only the skill owner can delete it
   */
  async deleteSkill(skillId: string, userId: string): Promise<void> {
    try {
      // Verify skill exists and user owns it
      const skill = await skillsRepository.getSkillById(skillId);

      if (!skill) {
        throw new AppError('Skill not found', 404);
      }

      if (skill.userId !== userId) {
        throw new AppError('You can only delete your own skills', 403);
      }

      await skillsRepository.deleteSkill(skillId, userId);

      logger.info('Skill deleted', { skillId, userId });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      logger.error('Error deleting skill', { skillId, userId, error: err });
      throw new AppError('Failed to delete skill', 500);
    }
  }

  /**
   * Endorse a skill in a community
   * Requires can_endorse_skills permission (trust >= 10 OR skill_endorser role OR admin)
   * Self-endorsement is allowed
   */
  async endorseSkill(
    skillId: string,
    endorserId: string,
    communityId: string
  ): Promise<EndorseSkillResponse> {
    try {
      // 1. Verify skill exists
      const skill = await skillsRepository.getSkillById(skillId);
      if (!skill) {
        throw new AppError('Skill not found', 404);
      }

      // 2. Check permission: can_endorse_skills
      // This automatically includes: admin OR skill_endorser OR trust_skill_endorser
      const canEndorse = await openFGAService.checkAccess(
        endorserId,
        'community',
        communityId,
        'can_endorse_skills'
      );

      if (!canEndorse) {
        throw new AppError(
          'You do not have permission to endorse skills. Requires trust level 10 or higher.',
          403
        );
      }

      // 3. Endorse the skill (idempotent - won't fail if already endorsed)
      await skillsRepository.endorseSkill(skillId, endorserId, communityId);

      logger.info('Skill endorsed', {
        skillId,
        skillName: skill.name,
        endorserId,
        communityId,
        isSelfEndorsement: skill.userId === endorserId,
      });

      return { success: true };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      logger.error('Error endorsing skill', {
        skillId,
        endorserId,
        communityId,
        error: err,
      });
      throw new AppError('Failed to endorse skill', 500);
    }
  }

  /**
   * Remove an endorsement (soft delete)
   * Users can only remove their own endorsements
   */
  async removeEndorsement(
    skillId: string,
    endorserId: string,
    communityId: string
  ): Promise<EndorseSkillResponse> {
    try {
      // Verify skill exists
      const skill = await skillsRepository.getSkillById(skillId);
      if (!skill) {
        throw new AppError('Skill not found', 404);
      }

      // Remove endorsement (idempotent)
      await skillsRepository.removeEndorsement(skillId, endorserId, communityId);

      logger.info('Endorsement removed', {
        skillId,
        skillName: skill.name,
        endorserId,
        communityId,
      });

      return { success: true };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      logger.error('Error removing endorsement', {
        skillId,
        endorserId,
        communityId,
        error: err,
      });
      throw new AppError('Failed to remove endorsement', 500);
    }
  }

  /**
   * Get skill suggestions for endorsement flow
   * If itemId provided, prioritize skills matching item's relatedSkills
   */
  async getSuggestedSkills(
    userId: string,
    communityId: string,
    viewerId: string,
    itemId?: string
  ): Promise<SkillSuggestionsResponse> {
    try {
      const suggestions = await skillsRepository.getSuggestedSkills(
        userId,
        communityId,
        viewerId,
        itemId
      );

      return { suggestions };
    } catch (err) {
      logger.error('Error fetching skill suggestions', {
        userId,
        communityId,
        itemId,
        error: err,
      });
      throw new AppError('Failed to fetch skill suggestions', 500);
    }
  }

  /**
   * Get top N skills for a user (for member list display)
   */
  async getTopSkills(
    userId: string,
    communityId: string,
    limit: number = 3
  ): Promise<SkillWithEndorsements[]> {
    try {
      return await skillsRepository.getTopSkills(userId, communityId, limit);
    } catch (err) {
      logger.error('Error fetching top skills', {
        userId,
        communityId,
        limit,
        error: err,
      });
      throw new AppError('Failed to fetch top skills', 500);
    }
  }
}

export const skillsService = new SkillsService();
