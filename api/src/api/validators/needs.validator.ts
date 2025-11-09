import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const needPriority = z.enum(['need', 'want']);
const needRecurrence = z.enum(['daily', 'weekly', 'monthly']);
const needStatus = z.enum(['active', 'fulfilled', 'cancelled', 'expired']);

export const createNeedSchema = z.object({
  body: z.object({
    communityId: z.string().uuid(),
    itemId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    priority: needPriority.default('need'),
    unitsNeeded: z.number().int().positive().default(1),
    // Recurrence fields
    isRecurring: z.boolean().default(false),
    recurrence: needRecurrence.optional().nullable(),
  }).refine(
    (data) => {
      // If isRecurring is true, recurrence must be provided
      if (data.isRecurring) {
        return !!data.recurrence;
      }
      return true;
    },
    {
      message: "recurrence is required when isRecurring is true",
      path: ["isRecurring"],
    }
  ),
});

export const updateNeedSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    priority: needPriority.optional(),
    unitsNeeded: z.number().int().positive().optional(),
    isRecurring: z.boolean().optional(),
    recurrence: needRecurrence.optional().nullable(),
    status: needStatus.optional(),
  }),
}).passthrough();

export const createCouncilNeedSchema = z.object({
  body: z.object({
    councilId: z.string().uuid(),
    communityId: z.string().uuid(),
    itemId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().optional().nullable(),
    priority: needPriority.default('need'),
    unitsNeeded: z.number().int().positive().default(1),
    // Recurrence fields
    isRecurring: z.boolean().default(false),
    recurrence: needRecurrence.optional().nullable(),
  }).refine(
    (data) => {
      // If isRecurring is true, recurrence must be provided
      if (data.isRecurring) {
        return !!data.recurrence;
      }
      return true;
    },
    {
      message: "recurrence is required when isRecurring is true",
      path: ["isRecurring"],
    }
  ),
});

export const updateCouncilNeedSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    priority: needPriority.optional(),
    unitsNeeded: z.number().int().positive().optional(),
    isRecurring: z.boolean().optional(),
    recurrence: needRecurrence.optional().nullable(),
    status: needStatus.optional(),
  }),
}).passthrough();

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const needListQuerySchema = z.object({
  query: z.object({
    communityId: z.string().uuid().optional(),
    priority: needPriority.optional(),
    status: needStatus.optional(),
    isRecurring: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  }),
}).passthrough();

export const councilNeedListQuerySchema = z.object({
  query: z.object({
    councilId: z.string().uuid().optional(),
    communityId: z.string().uuid().optional(),
    priority: needPriority.optional(),
    status: needStatus.optional(),
    isRecurring: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  }),
}).passthrough();

export const needSearchQuerySchema = z.object({
  query: z.object({
    q: z.string().max(200).optional(),
    communityId: z.string().uuid().optional(),
    priority: needPriority.optional(),
    status: needStatus.optional(),
    isRecurring: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    recurrence: needRecurrence.optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const aggregateNeedsQuerySchema = z.object({
  query: z.object({
    communityId: z.string().uuid(),
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

export const validateCreateNeed = (req: Request, res: Response, next: NextFunction) => {
  try {
    createNeedSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateUpdateNeed = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateNeedSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateCreateCouncilNeed = (req: Request, res: Response, next: NextFunction) => {
  try {
    createCouncilNeedSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateUpdateCouncilNeed = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateCouncilNeedSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
  try {
    idParamSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateNeedListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    needListQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateCouncilNeedListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    councilNeedListQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateNeedSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    needSearchQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateAggregateNeedsQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    aggregateNeedsQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};
