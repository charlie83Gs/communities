import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { skillsController } from '../controllers/skills.controller';
import {
  validateGetUserSkills,
  validateCreateSkill,
  validateDeleteSkill,
  validateEndorseSkill,
  validateRemoveEndorsement,
  validateGetSkillSuggestions,
} from '../validators/skills.validator';

const router = Router();

/**
 * Skills & Endorsements Routes (FT-19)
 *
 * User Skills Management (Own Profile):
 * - POST /users/skills (add skill to own profile - no permission check)
 * - DELETE /users/skills/:skillId (remove skill from own profile)
 *
 * Viewing Skills (Public within community):
 * - GET /users/:userId/skills (view user's skills with endorsement counts)
 * - GET /skills/suggestions/:userId (get contextual skill suggestions)
 *
 * Skill Endorsements (Requires Permission):
 * - POST /skills/:skillId/endorse (endorse skill - requires can_endorse_skills)
 * - DELETE /skills/:skillId/endorse (remove endorsement)
 *
 * Permission Model:
 * - Adding/removing own skills: No permission check (any user)
 * - Viewing skills: Any authenticated user (community member)
 * - Endorsing skills: Requires can_endorse_skills permission
 *   (admin OR skill_endorser role OR trust >= minTrustToEndorseSkills)
 * - Self-endorsement: Allowed (represents self-assessment)
 */

// ========== User Skills Management ==========

/**
 * POST /api/users/skills
 * Add a skill to current user's profile
 * - No permission check (users can always add their own skills)
 * - Skill is user-scoped (persists across all communities)
 */
router.post('/users/skills', verifyToken, validateCreateSkill, skillsController.createSkill);

/**
 * DELETE /api/users/skills/:skillId
 * Remove a skill from current user's profile
 * - User can only delete their own skills (checked in service)
 */
router.delete(
  '/users/skills/:skillId',
  verifyToken,
  validateDeleteSkill,
  skillsController.deleteSkill
);

// ========== Viewing Skills ==========

/**
 * GET /api/users/:userId/skills?communityId=xxx
 * Get user's skills with endorsement counts for a specific community
 * - Any authenticated user can view
 * - Returns endorsement counts scoped to the specified community
 * - Includes isEndorsedByMe flag for current user
 */
router.get(
  '/users/:userId/skills',
  verifyToken,
  validateGetUserSkills,
  skillsController.getUserSkills
);

/**
 * GET /api/skills/suggestions/:userId?communityId=xxx&itemId=xxx
 * Get skill suggestions for endorsement flow
 * - Used in wealth request endorsement modal
 * - If itemId provided: prioritizes skills matching item's relatedSkills
 * - If no itemId: returns all skills sorted by endorsement count
 */
router.get(
  '/skills/suggestions/:userId',
  verifyToken,
  validateGetSkillSuggestions,
  skillsController.getSuggestedSkills
);

// ========== Skill Endorsements ==========

/**
 * POST /api/skills/:skillId/endorse
 * Endorse a skill in a community
 * - Requires can_endorse_skills permission (checked in service via OpenFGA)
 * - Permission sources: admin OR skill_endorser OR trust_skill_endorser
 * - Default trust threshold: minTrustToEndorseSkills = 10
 * - Self-endorsement is allowed (1 point for self-assessment)
 * - Idempotent: won't fail if already endorsed
 */
router.post(
  '/skills/:skillId/endorse',
  verifyToken,
  validateEndorseSkill,
  skillsController.endorseSkill
);

/**
 * DELETE /api/skills/:skillId/endorse
 * Remove endorsement from a skill
 * - User can only remove their own endorsements
 * - Idempotent: won't fail if not endorsed
 */
router.delete(
  '/skills/:skillId/endorse',
  verifyToken,
  validateRemoveEndorsement,
  skillsController.removeEndorsement
);

export default router;
