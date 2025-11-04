import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ===== SCHEMAS =====

export const createCategorySchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    displayOrder: z.number().int().optional(),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
});

export const createThreadSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
    tags: z.array(z.string().max(50)).optional(),
  }),
});

export const listThreadsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sort: z.enum(['newest', 'popular', 'mostUpvoted']).optional(),
  }),
});

export const threadIdParamSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
});

export const updateThreadPinSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
  body: z.object({
    isPinned: z.boolean(),
  }),
});

export const updateThreadLockSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
  body: z.object({
    isLocked: z.boolean(),
  }),
});

export const setBestAnswerSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
  body: z.object({
    postId: z.string().uuid(),
  }),
});

export const voteSchema = z.object({
  body: z.object({
    voteType: z.enum(['up', 'down', 'remove']),
  }),
});

export const createPostSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    threadId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1).max(10000),
  }),
});

export const postIdParamSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    postId: z.string().uuid(),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    postId: z.string().uuid(),
  }),
  body: z.object({
    content: z.string().min(1).max(10000),
  }),
});

// ===== VALIDATOR MIDDLEWARE =====

function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
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
}

// ===== EXPORTED VALIDATORS =====

export const validateCreateCategory = validate(createCategorySchema);
export const validateUpdateCategory = validate(updateCategorySchema);
export const validateCategoryIdParam = validate(categoryIdParamSchema);

export const validateCreateThread = validate(createThreadSchema);
export const validateListThreads = validate(listThreadsSchema);
export const validateThreadIdParam = validate(threadIdParamSchema);
export const validateUpdateThreadPin = validate(updateThreadPinSchema);
export const validateUpdateThreadLock = validate(updateThreadLockSchema);
export const validateSetBestAnswer = validate(setBestAnswerSchema);

export const validateVote = validate(voteSchema);

export const validateCreatePost = validate(createPostSchema);
export const validatePostIdParam = validate(postIdParamSchema);
export const validateUpdatePost = validate(updatePostSchema);
