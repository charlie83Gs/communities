import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Fulfillment Strategy Schema
 */
const fulfillmentStrategySchema = z.enum(['full', 'partial', 'equal']);

/**
 * Create Pool Schema
 */
export const createPoolSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      councilId: z.string().uuid(),
    }),
    body: z.object({
      name: z.string().min(1).max(200),
      description: z.string().min(1),
      maxUnitsPerUser: z.number().int().positive().optional(),
      minimumContribution: z.number().int().positive().optional(),
      allowedItemIds: z.array(z.string().uuid()).optional(),
    }),
  })
  .passthrough();

/**
 * Get Pool Schema
 */
export const getPoolSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * List Community Pools Schema
 */
export const listCommunityPoolsSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Get Council Pools Schema
 */
export const getCouncilPoolsSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      councilId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Update Pool Schema
 */
export const updatePoolSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
    body: z.object({
      name: z.string().min(1).max(200).optional(),
      description: z.string().min(1).optional(),
      maxUnitsPerUser: z.number().int().positive().optional(),
      minimumContribution: z.number().int().positive().optional(),
      allowedItemIds: z.array(z.string().uuid()).optional(),
    }),
  })
  .passthrough();

/**
 * Delete Pool Schema
 */
export const deletePoolSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Contribute to Pool Schema
 */
export const contributeToPoolSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
    body: z.object({
      itemId: z.string().uuid(),
      unitsOffered: z.number().int().positive(),
      message: z.string().max(500).optional(),
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
    }),
  })
  .passthrough();

/**
 * List Pending Contributions Schema
 */
export const listPendingContributionsSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Confirm Contribution Schema
 */
export const confirmContributionSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
      wealthId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Reject Contribution Schema
 */
export const rejectContributionSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
      wealthId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Distribute from Pool Schema
 */
export const distributeFromPoolSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
    body: z.object({
      recipientId: z.string(),
      itemId: z.string().uuid(),
      unitsDistributed: z.number().int().positive(),
      title: z.string().min(1).max(200),
      description: z.string().max(1000).optional(),
    }),
  })
  .passthrough();

/**
 * Mass Distribute Schema
 */
export const massDistributeSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
    body: z.object({
      itemId: z.string().uuid(),
      maxUnitsPerUser: z.number().int().positive().optional(),
      selectedUserIds: z.array(z.string()).optional(),
      fulfillmentStrategy: fulfillmentStrategySchema,
    }),
  })
  .passthrough();

/**
 * Preview Mass Distribution Schema
 */
export const previewMassDistributionSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
    body: z.object({
      itemId: z.string().uuid(),
      maxUnitsPerUser: z.number().int().positive().optional(),
      selectedUserIds: z.array(z.string()).optional(),
      fulfillmentStrategy: fulfillmentStrategySchema,
    }),
  })
  .passthrough();

/**
 * Get Pool Inventory Schema
 */
export const getPoolInventorySchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
  })
  .passthrough();

/**
 * Helper function to handle Zod validation
 */
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
 * Validator Middleware Functions
 */
export const validateCreatePool = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createPoolSchema.parse(req), res, next);

export const validateGetPool = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getPoolSchema.parse(req), res, next);

export const validateListCommunityPools = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listCommunityPoolsSchema.parse(req), res, next);

export const validateGetCouncilPools = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getCouncilPoolsSchema.parse(req), res, next);

export const validateUpdatePool = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updatePoolSchema.parse(req), res, next);

export const validateDeletePool = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => deletePoolSchema.parse(req), res, next);

export const validateContributeToPool = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => contributeToPoolSchema.parse(req), res, next);

export const validateListPendingContributions = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listPendingContributionsSchema.parse(req), res, next);

export const validateConfirmContribution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => confirmContributionSchema.parse(req), res, next);

export const validateRejectContribution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => rejectContributionSchema.parse(req), res, next);

export const validateDistributeFromPool = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => distributeFromPoolSchema.parse(req), res, next);

export const validateMassDistribute = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => massDistributeSchema.parse(req), res, next);

export const validatePreviewMassDistribution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => previewMassDistributionSchema.parse(req), res, next);

export const validateGetPoolInventory = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getPoolInventorySchema.parse(req), res, next);

/**
 * Get Pool Needs Schema
 */
export const getPoolNeedsSchema = z
  .object({
    params: z.object({
      communityId: z.string().uuid(),
      poolId: z.string().uuid(),
    }),
  })
  .passthrough();

export const validateGetPoolNeeds = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getPoolNeedsSchema.parse(req), res, next);
