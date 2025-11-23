import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Skills & Endorsements Validators (FT-19)
 *
 * Validation schemas for the skills and endorsements system.
 */

// Helper function to handle Zod validation
function handleZod(parse: () => unknown, res: Response, next: NextFunction) {
  try {
    parse();
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        errors: err.issues,
      });
    }
    next(err);
  }
}

/**
 * GET /api/users/:userId/skills?communityId=xxx
 * Get user's skills with endorsement counts for a community
 */
export const getUserSkillsSchema = z
  .object({
    params: z.object({
      userId: z.string().min(1, 'User ID is required'),
    }),
    query: z.object({
      communityId: z.string().uuid('Community ID must be a valid UUID'),
    }),
  })
  .passthrough();

export const validateGetUserSkills = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getUserSkillsSchema.parse(req), res, next);

/**
 * POST /api/users/skills
 * Create a new skill for current user
 */
export const createSkillSchema = z
  .object({
    body: z.object({
      name: z
        .string()
        .min(1, 'Skill name is required')
        .max(50, 'Skill name must be 50 characters or less')
        .regex(
          /^[a-zA-Z0-9\s\-&]+$/,
          'Skill name can only contain letters, numbers, spaces, hyphens, and ampersands'
        )
        .transform((val) => val.trim()),
    }),
  })
  .passthrough();

export const validateCreateSkill = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createSkillSchema.parse(req), res, next);

/**
 * DELETE /api/users/skills/:skillId
 * Delete a skill from current user's profile
 */
export const deleteSkillSchema = z
  .object({
    params: z.object({
      skillId: z.string().uuid('Skill ID must be a valid UUID'),
    }),
  })
  .passthrough();

export const validateDeleteSkill = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => deleteSkillSchema.parse(req), res, next);

/**
 * POST /api/skills/:skillId/endorse
 * Endorse a skill in a community
 */
export const endorseSkillSchema = z
  .object({
    params: z.object({
      skillId: z.string().uuid('Skill ID must be a valid UUID'),
    }),
    body: z.object({
      communityId: z.string().uuid('Community ID must be a valid UUID'),
    }),
  })
  .passthrough();

export const validateEndorseSkill = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => endorseSkillSchema.parse(req), res, next);

/**
 * DELETE /api/skills/:skillId/endorse
 * Remove endorsement from a skill
 */
export const removeEndorsementSchema = z
  .object({
    params: z.object({
      skillId: z.string().uuid('Skill ID must be a valid UUID'),
    }),
    body: z.object({
      communityId: z.string().uuid('Community ID must be a valid UUID'),
    }),
  })
  .passthrough();

export const validateRemoveEndorsement = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => removeEndorsementSchema.parse(req), res, next);

/**
 * GET /api/skills/suggestions/:userId?communityId=xxx&itemId=xxx
 * Get skill suggestions for endorsement flow
 */
export const getSkillSuggestionsSchema = z
  .object({
    params: z.object({
      userId: z.string().min(1, 'User ID is required'),
    }),
    query: z.object({
      communityId: z.string().uuid('Community ID must be a valid UUID'),
      itemId: z.string().uuid('Item ID must be a valid UUID').optional(),
    }),
  })
  .passthrough();

export const validateGetSkillSuggestions = (
  req: Request,
  res: Response,
  next: NextFunction
) => handleZod(() => getSkillSuggestionsSchema.parse(req), res, next);
