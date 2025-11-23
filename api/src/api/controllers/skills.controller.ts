import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/api/middleware/auth.middleware';
import { skillsService } from '@/services/skills.service';
import { ApiResponse } from '@/utils/response';
import logger from '@/utils/logger';

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Skills and endorsements management (FT-19)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SkillWithEndorsements:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           maxLength: 50
 *         endorsementCount:
 *           type: integer
 *           minimum: 0
 *         isEndorsedByMe:
 *           type: boolean
 *     UserSkill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *           maxLength: 50
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ContextualSkillSuggestion:
 *       type: object
 *       properties:
 *         skillId:
 *           type: string
 *           format: uuid
 *         skillName:
 *           type: string
 *         isRelated:
 *           type: boolean
 *           description: True if skill matches item's relatedSkills
 *         endorsementCount:
 *           type: integer
 *         isEndorsedByMe:
 *           type: boolean
 */
class SkillsController {
  /**
   * @swagger
   * /api/users/{userId}/skills:
   *   get:
   *     summary: Get user's skills with endorsement counts for a community
   *     tags: [Skills]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *       - in: query
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID for endorsement context
   *     responses:
   *       200:
   *         description: User skills with endorsement data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 skills:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/SkillWithEndorsements'
   *       400:
   *         description: Invalid parameters
   *       401:
   *         description: Unauthorized
   */
  async getUserSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { communityId } = req.query;
      const viewerId = (req as any).user?.id;

      const result = await skillsService.getUserSkills(
        userId,
        communityId as string,
        viewerId
      );

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/skills:
   *   post:
   *     summary: Add a skill to current user's profile
   *     tags: [Skills]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 50
   *                 pattern: '^[a-zA-Z0-9\s\-&]+$'
   *                 description: Skill name (alphanumeric + space/hyphen/ampersand)
   *                 example: "JavaScript"
   *     responses:
   *       201:
   *         description: Skill created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 skill:
   *                   $ref: '#/components/schemas/UserSkill'
   *       400:
   *         description: Invalid skill name
   *       401:
   *         description: Unauthorized
   *       409:
   *         description: Skill already exists
   */
  async createSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await skillsService.createSkill(userId, req.body);

      logger.info('Skill created via API', {
        skillId: result.skill.id,
        userId,
        name: result.skill.name,
      });

      return ApiResponse.created(res, result, 'Skill created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/users/skills/{skillId}:
   *   delete:
   *     summary: Remove a skill from current user's profile
   *     tags: [Skills]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Skill ID
   *     responses:
   *       204:
   *         description: Skill deleted successfully
   *       403:
   *         description: Can only delete own skills
   *       404:
   *         description: Skill not found
   */
  async deleteSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { skillId } = req.params;
      const userId = (req as any).user?.id;

      await skillsService.deleteSkill(skillId, userId);

      logger.info('Skill deleted via API', { skillId, userId });
      return ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/skills/{skillId}/endorse:
   *   post:
   *     summary: Endorse a skill in a community
   *     description: Requires can_endorse_skills permission (trust >= 10 OR skill_endorser role OR admin). Self-endorsement is allowed.
   *     tags: [Skills]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Skill ID to endorse
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - communityId
   *             properties:
   *               communityId:
   *                 type: string
   *                 format: uuid
   *                 description: Community context for endorsement
   *     responses:
   *       200:
   *         description: Skill endorsed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *       403:
   *         description: Insufficient trust to endorse skills
   *       404:
   *         description: Skill not found
   */
  async endorseSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { skillId } = req.params;
      const { communityId } = req.body;
      const endorserId = (req as any).user?.id;

      const result = await skillsService.endorseSkill(skillId, endorserId, communityId);

      logger.info('Skill endorsed via API', {
        skillId,
        endorserId,
        communityId,
      });

      return ApiResponse.success(res, result, 'Skill endorsed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/skills/{skillId}/endorse:
   *   delete:
   *     summary: Remove endorsement from a skill
   *     tags: [Skills]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Skill ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - communityId
   *             properties:
   *               communityId:
   *                 type: string
   *                 format: uuid
   *                 description: Community context
   *     responses:
   *       200:
   *         description: Endorsement removed successfully
   *       404:
   *         description: Skill not found
   */
  async removeEndorsement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { skillId } = req.params;
      const { communityId } = req.body;
      const endorserId = (req as any).user?.id;

      const result = await skillsService.removeEndorsement(
        skillId,
        endorserId,
        communityId
      );

      logger.info('Endorsement removed via API', {
        skillId,
        endorserId,
        communityId,
      });

      return ApiResponse.success(res, result, 'Endorsement removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/skills/suggestions/{userId}:
   *   get:
   *     summary: Get skill suggestions for endorsement flow
   *     description: Returns user's skills with contextual suggestions based on item's relatedSkills
   *     tags: [Skills]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User whose skills to suggest
   *       - in: query
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community context
   *       - in: query
   *         name: itemId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Item ID for contextual suggestions (optional)
   *     responses:
   *       200:
   *         description: Skill suggestions
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 suggestions:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ContextualSkillSuggestion'
   */
  async getSuggestedSkills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { communityId, itemId } = req.query;
      const viewerId = (req as any).user?.id;

      const result = await skillsService.getSuggestedSkills(
        userId,
        communityId as string,
        viewerId,
        itemId as string | undefined
      );

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const skillsController = new SkillsController();
