import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const durationType = z.enum(['timebound', 'unlimited']);
const distributionType = z.enum(['request_based', 'unit_based']);
const wealthStatus = z.enum(['active', 'fulfilled', 'expired', 'cancelled']);
const wealthRequestStatus = z.enum(['pending', 'accepted', 'rejected', 'cancelled', 'fulfilled']);

export const createWealthSchema = z.object({
  body: z.object({
    communityId: z.string().uuid(),
    itemId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    image: z.string().max(255).optional().nullable(),
    durationType: durationType,
    endDate: z.string().datetime().or(z.date()).optional().nullable(),
    distributionType: distributionType,
    unitsAvailable: z.number().int().positive().optional().nullable(),
    maxUnitsPerUser: z.number().int().positive().optional().nullable(),
    automationEnabled: z.boolean().optional(),
  }),
});

export const updateWealthSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    image: z.string().max(255).optional().nullable(),
    endDate: z.string().datetime().or(z.date()).optional().nullable(),
    unitsAvailable: z.number().int().nonnegative().optional(),
    maxUnitsPerUser: z.number().int().positive().optional(),
    automationEnabled: z.boolean().optional(),
    status: wealthStatus.optional(),
  }),
}).passthrough();

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const wealthListQuerySchema = z.object({
  query: z.object({
    communityId: z.string().uuid().optional(),
    status: wealthStatus.optional(),
  }),
}).passthrough();

/**
 * Search wealths query schema
 * - q: search text (title or description)
 * - durationType, distributionType, status: filters
 * - communityId: optional narrowing to a single community
 * - endDateBefore / endDateAfter: optional range filters for timebound wealths
 */
export const wealthSearchQuerySchema = z.object({
  query: z.object({
    q: z.string().max(200).optional(),
    communityId: z.string().uuid().optional(),
    durationType: durationType.optional(),
    distributionType: distributionType.optional(),
    status: wealthStatus.optional(),
    endDateBefore: z.string().datetime().or(z.date()).optional(),
    endDateAfter: z.string().datetime().or(z.date()).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

/**
 * Query schema for listing a user's wealth requests
 * - statuses: optional list of request statuses to filter by
 *   Accepts either a single string, a comma-separated string, or an array of enums.
 */
export const wealthRequestStatusesQuerySchema = z.object({
  query: z.object({
    statuses: z
      .union([
        wealthRequestStatus,
        z.string(),
        z.array(wealthRequestStatus),
      ])
      .optional(),
  }),
});

export const requestWealthSchema = z.object({
  params: z.object({
    id: z.string().uuid(), // wealthId
  }),
  body: z.object({
    message: z.string().max(2000).optional().nullable(),
    unitsRequested: z.number().int().positive().optional().nullable(),
  }),
}).passthrough();

export const requestIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    requestId: z.string().uuid(),
  }),
}).passthrough();

// Middleware helpers
function handleZodError(res: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      errors: error.issues,
    });
  }
  return null;
}

export const validateCreateWealth = (req: Request, res: Response, next: NextFunction) => {
  try {
    createWealthSchema.parse(req);
    // extra rule: if durationType is timebound, endDate must be present
    if (req.body.durationType === 'timebound' && !req.body.endDate) {
      return res.status(400).json({ status: 'error', message: 'endDate is required for timebound wealths' });
    }
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateUpdateWealth = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateWealthSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateWealthListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    wealthListQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateWealthSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    wealthSearchQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

/**
 * Normalize 'statuses' into an array of enums (or undefined)
 */
function parseStatuses(input: unknown): Array<z.infer<typeof wealthRequestStatus>> | undefined {
  if (input == null) return undefined;
  if (Array.isArray(input)) {
    return input as Array<z.infer<typeof wealthRequestStatus>>;
  }
  if (typeof input === 'string') {
    // support comma-separated values or a single value
    const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
    return parts as Array<z.infer<typeof wealthRequestStatus>>;
  }
  // single enum value
  return [input as z.infer<typeof wealthRequestStatus>];
}

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  try {
    idParamSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateRequestWealth = (req: Request, res: Response, next: NextFunction) => {
  try {
    requestWealthSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateRequestIdParams = (req: Request, res: Response, next: NextFunction) => {
  try {
    requestIdParamSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateWealthRequestStatusesQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    wealthRequestStatusesQuerySchema.parse(req);
    // normalize into array for controller/service convenience
    const statuses = parseStatuses(req.query.statuses);
    if (statuses) {
      (req as any).parsedStatuses = statuses;
    }
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

// Comment validation schemas

export const createCommentSchema = z.object({
  params: z.object({
    wealthId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1).max(2000),
    parentId: z.string().uuid().optional().nullable(),
  }),
}).passthrough();

export const listCommentsSchema = z.object({
  params: z.object({
    wealthId: z.string().uuid(),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),
}).passthrough();

export const updateCommentSchema = z.object({
  params: z.object({
    wealthId: z.string().uuid(),
    commentId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1).max(2000).optional(),
  }),
}).passthrough();

export const deleteCommentSchema = z.object({
  params: z.object({
    wealthId: z.string().uuid(),
    commentId: z.string().uuid(),
  }),
}).passthrough();

// Validation middleware for comments

export const validateCreateComment = (req: Request, res: Response, next: NextFunction) => {
  try {
    createCommentSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateListComments = (req: Request, res: Response, next: NextFunction) => {
  try {
    listCommentsSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateUpdateComment = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateCommentSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateDeleteComment = (req: Request, res: Response, next: NextFunction) => {
  try {
    deleteCommentSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};