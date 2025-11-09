import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Schema for GET /communities/:communityId/councils/managed
 * Validates the communityId parameter
 */
export const getManagedCouncilsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
}).passthrough();

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

export const validateGetManagedCouncils = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getManagedCouncilsSchema.parse(req), res, next);
