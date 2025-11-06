import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const updatePreferencesSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const validateUpdatePreferences = (req: Request, res: Response, next: NextFunction) => {
  try {
    updatePreferencesSchema.parse({
      body: req.body,
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

export const uploadProfileImageSchema = z.object({
  file: z
    .object({
      buffer: z.instanceof(Buffer),
      mimetype: z.string(),
      size: z.number().max(5 * 1024 * 1024, { message: 'Max 5MB for profile image' }),
      originalname: z.string().min(1),
    })
    .passthrough(),
});

export function validateUploadProfileImage(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file as any | undefined;
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'Profile image file is required (field: image)' });
    }
    uploadProfileImageSchema.parse({ file });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', errors: err.issues });
    }
    next(err);
  }
}