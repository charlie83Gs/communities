import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createTrustLevelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    threshold: z.number().int().min(0),
  }),
  params: z.object({
    communityId: z.string().uuid(),
  }),
});

export const updateTrustLevelSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    threshold: z.number().int().min(0).optional(),
  }),
  params: z.object({
    communityId: z.string().uuid(),
    levelId: z.string().uuid(),
  }),
});

export const getTrustLevelSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    levelId: z.string().uuid(),
  }),
});

export const listTrustLevelsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
});

export const deleteTrustLevelSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    levelId: z.string().uuid(),
  }),
});

export const resolveTrustReferenceSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    reference: z.string().min(1).max(100),
  }),
});

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

export const validateCreateTrustLevel = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createTrustLevelSchema.parse(req), res, next);

export const validateUpdateTrustLevel = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateTrustLevelSchema.parse(req), res, next);

export const validateGetTrustLevel = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getTrustLevelSchema.parse(req), res, next);

export const validateListTrustLevels = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listTrustLevelsSchema.parse(req), res, next);

export const validateDeleteTrustLevel = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => deleteTrustLevelSchema.parse(req), res, next);

export const validateResolveTrustReference = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => resolveTrustReferenceSchema.parse(req), res, next);
