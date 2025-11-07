import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const getUserInvitesSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const validateGetUserInvites = (req: Request, res: Response, next: NextFunction) => {
  try {
    getUserInvitesSchema.parse({
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        errors: error.issues,
      });
    }
    next(error);
  }
};
