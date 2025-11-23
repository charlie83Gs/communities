import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Middleware helper
function handleZodError(res: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      errors: error.issues,
    });
  }
  return null;
}

export const notificationListQuerySchema = z.object({
  query: z.object({
    community_id: z.string().uuid().optional(),
    unread_only: z.enum(['true', 'false']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  }),
}).passthrough();

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
}).passthrough();

export const communityIdQuerySchema = z.object({
  query: z.object({
    community_id: z.string().uuid().optional(),
  }),
}).passthrough();

export const validateNotificationListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    notificationListQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateNotificationIdParam = (req: Request, res: Response, next: NextFunction) => {
  try {
    notificationIdParamSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateCommunityIdQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    communityIdQuerySchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};
