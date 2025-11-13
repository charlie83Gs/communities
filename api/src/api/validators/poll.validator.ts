import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * Schema for creating a poll
 */
const createPollSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    options: z
      .array(z.string().min(1, 'Option text is required').max(200, 'Option must be 200 characters or less'))
      .min(2, 'Poll must have at least 2 options')
      .max(10, 'Poll cannot have more than 10 options'),
    duration: z.number().int().min(1, 'Duration must be at least 1 hour').max(720, 'Duration cannot exceed 720 hours (30 days)'),
    creatorType: z.enum(['user', 'council', 'pool']),
    creatorId: z.string().uuid().optional(),
  }),
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
  }),
});

/**
 * Schema for list polls query
 */
const listPollsQuerySchema = z.object({
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
  }),
  query: z.object({
    status: z.enum(['active', 'closed']).optional(),
    creatorType: z.enum(['user', 'council', 'pool']).optional(),
  }),
});

/**
 * Schema for get poll by ID
 */
const getPollByIdSchema = z.object({
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
    pollId: z.string().uuid('Invalid poll ID'),
  }),
});

/**
 * Schema for voting on a poll
 */
const voteSchema = z.object({
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
    pollId: z.string().uuid('Invalid poll ID'),
  }),
  body: z.object({
    optionId: z.string().uuid('Invalid option ID'),
  }),
});

/**
 * Schema for closing a poll
 */
const closePollSchema = z.object({
  params: z.object({
    communityId: z.string().uuid('Invalid community ID'),
    pollId: z.string().uuid('Invalid poll ID'),
  }),
});

/**
 * Middleware to validate create poll request
 */
export const validateCreatePoll = (req: Request, res: Response, next: NextFunction) => {
  try {
    createPollSchema.parse({ body: req.body, params: req.params });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate list polls query
 */
export const validateListPollsQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    listPollsQuerySchema.parse({ params: req.params, query: req.query });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate get poll by ID
 */
export const validateGetPollById = (req: Request, res: Response, next: NextFunction) => {
  try {
    getPollByIdSchema.parse({ params: req.params });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate vote request
 */
export const validateVote = (req: Request, res: Response, next: NextFunction) => {
  try {
    voteSchema.parse({ params: req.params, body: req.body });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate close poll request
 */
export const validateClosePoll = (req: Request, res: Response, next: NextFunction) => {
  try {
    closePollSchema.parse({ params: req.params });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: error.issues,
      });
    }
    next(error);
  }
};
