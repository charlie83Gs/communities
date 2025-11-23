import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { FEATURE_ROLES } from '../../config/openfga.constants';

/**
 * TrustRequirement schema matching the TrustRequirement type from trustLevel.types.ts
 *
 * Accepts two formats:
 * - { type: 'number', value: <non-negative integer> }
 * - { type: 'level', value: <UUID string> }
 *
 * This replaces the old plain number format to support both direct numeric thresholds
 * and references to trust levels defined in the community.
 */
const trustRequirementSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('number'),
    value: z.number().int().min(0),
  }),
  z.object({
    type: z.literal('level'),
    value: z.string().uuid(),
  }),
]);

const trustTitleSchema = z.object({
  name: z.string().min(1).max(50),
  minScore: z.number().int().min(0),
});

const metricVisibilitySchema = z.object({
  showActiveMembers: z.boolean().optional(),
  showWealthGeneration: z.boolean().optional(),
  showTrustNetwork: z.boolean().optional(),
  showCouncilActivity: z.boolean().optional(),
  showNeedsFulfillment: z.boolean().optional(),
  showDisputeRate: z.boolean().optional(),
});

const featureFlagsSchema = z.object({
  poolsEnabled: z.boolean(),
  needsEnabled: z.boolean(),
  pollsEnabled: z.boolean(),
  councilsEnabled: z.boolean(),
  forumEnabled: z.boolean(),
  healthAnalyticsEnabled: z.boolean(),
  disputesEnabled: z.boolean(),
  contributionsEnabled: z.boolean(),
});

export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),

    // Trust System Configuration
    minTrustToAwardTrust: trustRequirementSchema.optional(),
    trustTitles: z.object({
      titles: z.array(trustTitleSchema),
    }).optional(),

    // Wealth Access Configuration
    minTrustForWealth: trustRequirementSchema.optional(),

    // Dispute Handling Configuration
    minTrustForDisputes: trustRequirementSchema.optional(),
    disputeResolutionRole: z.string().max(100).optional(),
    disputeHandlingCouncils: z.array(z.string().uuid()).optional(),

    // Polling Permissions
    pollCreatorUsers: z.array(z.string().uuid()).optional(),
    minTrustForPolls: trustRequirementSchema.optional(),

    // Forum Configuration
    minTrustForThreadCreation: trustRequirementSchema.optional(),
    minTrustForForumModeration: trustRequirementSchema.optional(),

    // Analytics Configuration
    nonContributionThresholdDays: z.number().int().min(1).optional(),
    dashboardRefreshInterval: z.number().int().min(60).optional(),
    metricVisibilitySettings: metricVisibilitySchema.optional(),

    // Feature Flags
    featureFlags: featureFlagsSchema.optional(),
  }),
}).passthrough();

export const updateCommunitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),

    // Trust System Configuration
    minTrustToAwardTrust: trustRequirementSchema.optional(),
    trustTitles: z.object({
      titles: z.array(trustTitleSchema),
    }).optional(),

    // Wealth Access Configuration
    minTrustForWealth: trustRequirementSchema.optional(),

    // Dispute Handling Configuration
    minTrustForDisputes: trustRequirementSchema.optional(),
    disputeResolutionRole: z.string().max(100).optional(),
    disputeHandlingCouncils: z.array(z.string().uuid()).optional(),

    // Polling Permissions
    pollCreatorUsers: z.array(z.string().uuid()).optional(),
    minTrustForPolls: trustRequirementSchema.optional(),

    // Forum Configuration
    minTrustForThreadCreation: trustRequirementSchema.optional(),
    minTrustForForumModeration: trustRequirementSchema.optional(),

    // Analytics Configuration
    nonContributionThresholdDays: z.number().int().min(1).optional(),
    dashboardRefreshInterval: z.number().int().min(60).optional(),
    metricVisibilitySettings: metricVisibilitySchema.optional(),

    // Feature Flags
    featureFlags: featureFlagsSchema.optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const getCommunitySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const listCommunitiesSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

// Members endpoints
export const getMembersSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
}).passthrough();

export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  body: z.object({
    role: z.string().min(1).max(64),
  }),
}).passthrough();

export const getMemberByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
}).passthrough();

export const updateMemberFeatureRolesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  }),
  body: z.object({
    roles: z.array(z.enum(FEATURE_ROLES)).min(0).max(FEATURE_ROLES.length),
  }),
}).passthrough();

function handleZod(
  parse: () => unknown,
  res: Response,
  next: NextFunction
) {
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

export const validateCreateCommunity = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createCommunitySchema.parse(req), res, next);

export const validateUpdateCommunity = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateCommunitySchema.parse(req), res, next);

export const validateGetCommunity = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getCommunitySchema.parse(req), res, next);

export const validateListCommunities = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listCommunitiesSchema.parse(req), res, next);

export const validateGetMembers = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getMembersSchema.parse(req), res, next);

export const validateRemoveMember = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => removeMemberSchema.parse(req), res, next);

export const validateUpdateMemberRole = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateMemberRoleSchema.parse(req), res, next);

export const validateGetMemberById = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getMemberByIdSchema.parse(req), res, next);

export const validateUpdateMemberFeatureRoles = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateMemberFeatureRolesSchema.parse(req), res, next);

// Search communities query schema and validator
// - q: search text (name or description)
// - pagination: page, limit

export const communitySearchQuerySchema = z.object({
  query: z.object({
    q: z.string().max(200).optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

export const validateCommunitySearchQuery = (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  try {
    communitySearchQuerySchema.parse(req);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        errors: error.issues,
      });
    }
    next(error);
  }
};
