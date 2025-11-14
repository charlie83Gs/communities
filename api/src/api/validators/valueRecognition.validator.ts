import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Source type enum
const sourceType = z.enum(['system_logged', 'peer_grant', 'self_reported']);

// Verification status enum
const verificationStatus = z.enum(['auto_verified', 'pending', 'verified', 'disputed']);

/**
 * Log contribution schema
 */
export const logContributionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  body: z.object({
    itemId: z.string().uuid(),
    units: z.number().positive(),
    description: z.string().min(1).max(1000),
    beneficiaryIds: z.array(z.string()).optional(),
    witnessIds: z.array(z.string()).optional(),
    sourceType: sourceType.optional().default('self_reported'),
  }),
}).passthrough();

/**
 * Verify contribution schema
 */
export const verifyContributionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    contributionId: z.string().uuid(),
  }),
  body: z.object({
    testimonial: z.string().max(2000).optional(),
  }),
}).passthrough();

/**
 * Dispute contribution schema
 */
export const disputeContributionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    contributionId: z.string().uuid(),
  }),
  body: z.object({
    reason: z.string().min(1).max(1000),
  }),
}).passthrough();

/**
 * Grant peer recognition schema
 */
export const grantPeerRecognitionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  body: z.object({
    toUserId: z.string(),
    valueUnits: z.number().positive().max(100), // Prevent abuse with max
    description: z.string().min(1).max(500),
  }),
}).passthrough();

/**
 * Get contribution profile schema
 */
export const getContributionProfileSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    userId: z.string().optional(), // Optional - defaults to current user
  }),
}).passthrough();

/**
 * Get pending verifications schema
 */
export const getPendingVerificationsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
}).passthrough();

/**
 * Get peer recognition limits schema
 */
export const getPeerRecognitionLimitsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
}).passthrough();

/**
 * Get peer recognition grants schema
 */
export const getPeerRecognitionGrantsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

/**
 * Update item value schema
 */
export const updateItemValueSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    itemId: z.string().uuid(),
  }),
  body: z.object({
    newValue: z.number().positive(),
    reason: z.string().min(1).max(1000),
    decidedThrough: z.enum(['council', 'community_poll', 'consensus', 'admin']).optional(),
  }),
}).passthrough();

/**
 * Get value calibration history schema
 */
export const getValueCalibrationHistorySchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  query: z.object({
    itemId: z.string().uuid().optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

// Validator middleware helper
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

// Export validator middleware functions
export const validateLogContribution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => logContributionSchema.parse(req), res, next);

export const validateVerifyContribution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => verifyContributionSchema.parse(req), res, next);

export const validateDisputeContribution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => disputeContributionSchema.parse(req), res, next);

export const validateGrantPeerRecognition = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => grantPeerRecognitionSchema.parse(req), res, next);

export const validateGetContributionProfile = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getContributionProfileSchema.parse(req), res, next);

export const validateGetPendingVerifications = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getPendingVerificationsSchema.parse(req), res, next);

export const validateGetPeerRecognitionLimits = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getPeerRecognitionLimitsSchema.parse(req), res, next);

export const validateGetPeerRecognitionGrants = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getPeerRecognitionGrantsSchema.parse(req), res, next);

export const validateUpdateItemValue = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateItemValueSchema.parse(req), res, next);

export const validateGetValueCalibrationHistory = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getValueCalibrationHistorySchema.parse(req), res, next);
