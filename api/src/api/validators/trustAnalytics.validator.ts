import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Schema for GET /api/v1/users/me/trust/timeline query parameters
 */
export const getTrustTimelineSchema = z.object({
  query: z.object({
    communityId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

/**
 * Schema for GET /api/v1/users/me/trust/summary query parameters
 */
export const getTrustSummarySchema = z.object({
  query: z.object({
    communityId: z.string().uuid().optional(),
  }),
});

/**
 * Middleware to validate GET /api/v1/users/me/trust/timeline request
 */
export const validateGetTrustTimeline = (req: Request, res: Response, next: NextFunction) => {
  try {
    getTrustTimelineSchema.parse({ query: req.query });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate GET /api/v1/users/me/trust/summary request
 */
export const validateGetTrustSummary = (req: Request, res: Response, next: NextFunction) => {
  try {
    getTrustSummarySchema.parse({ query: req.query });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.errors,
      });
    }
    next(error);
  }
};
