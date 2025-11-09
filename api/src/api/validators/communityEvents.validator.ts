import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Event type enum
const eventTypeEnum = z.enum([
  'need_created',
  'need_updated',
  'need_fulfilled',
  'need_deleted',
  'wealth_created',
  'wealth_updated',
  'wealth_fulfilled',
  'wealth_deleted',
  'poll_created',
  'poll_completed',
  'poll_deleted',
  'forum_thread_created',
  'forum_post_created',
  'forum_thread_deleted',
  'forum_post_deleted',
  'council_created',
  'council_updated',
  'council_deleted',
  'trust_awarded',
  'trust_removed',
]).optional();

/**
 * Validation for GET /communities/:communityId/events
 */
const listEventsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
  }),
  query: z.object({
    eventType: eventTypeEnum,
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }).partial(),
});

/**
 * Validation for GET /communities/:communityId/events/user/:targetUserId
 */
const listUserEventsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
    targetUserId: z.string().min(1, 'Target user ID is required'),
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
  }).partial(),
});

// Helper function to handle Zod errors
function handleZodError(res: Response, error: any) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.issues,
    });
  }
  return null;
}

export const validateListEvents = (req: Request, res: Response, next: NextFunction) => {
  try {
    listEventsSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};

export const validateListUserEvents = (req: Request, res: Response, next: NextFunction) => {
  try {
    listUserEventsSchema.parse(req);
    next();
  } catch (err) {
    const r = handleZodError(res, err);
    if (!r) next(err);
  }
};
