import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Create consumption schema
export const createConsumptionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
  }),
  body: z.object({
    poolId: z.string().uuid(),
    itemId: z.string().uuid(),
    units: z.number().int().min(1),
    description: z.string().min(3).max(500),
    reportId: z.string().uuid().optional().nullable(),
  }),
}).passthrough();

// List consumptions schema
export const listConsumptionsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

// Get consumption by ID schema
export const getConsumptionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    consumptionId: z.string().uuid(),
  }),
}).passthrough();

// Update consumption schema
export const updateConsumptionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    consumptionId: z.string().uuid(),
  }),
  body: z.object({
    description: z.string().min(3).max(500).optional(),
    reportId: z.string().uuid().optional().nullable(),
  }),
}).passthrough();

// Link consumptions to report schema
export const linkToReportSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
  }),
  body: z.object({
    consumptionIds: z.array(z.string().uuid()).min(1).max(50),
    reportId: z.string().uuid(),
  }),
}).passthrough();

// Delete consumption schema
export const deleteConsumptionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    consumptionId: z.string().uuid(),
  }),
}).passthrough();

// Helper function for Zod validation
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

// Validator middleware functions
export const validateCreateConsumption = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createConsumptionSchema.parse(req), res, next);

export const validateListConsumptions = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listConsumptionsSchema.parse(req), res, next);

export const validateGetConsumption = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getConsumptionSchema.parse(req), res, next);

export const validateUpdateConsumption = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateConsumptionSchema.parse(req), res, next);

export const validateLinkToReport = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => linkToReportSchema.parse(req), res, next);

export const validateDeleteConsumption = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => deleteConsumptionSchema.parse(req), res, next);
