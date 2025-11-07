import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// Multer puts the uploaded file on req.file. Since Express's Request type
// doesn't include this by default, we access it via (req as any).file here.
export const uploadImageSchema = z.object({
  file: z
    .object({
      buffer: z.instanceof(Buffer),
      mimetype: z.string(),
      size: z.number().max(10 * 1024 * 1024, { message: 'Max 10MB' }),
      originalname: z.string().min(1),
    })
    .passthrough(),
});

export function validateUploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file as any | undefined;
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'Image file is required (field: image)' });
    }
    uploadImageSchema.parse({ file });
    return next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', errors: err.issues });
    }
    return next(err);
  }
}

export const getImageSchema = z.object({
  params: z.object({
    filename: z
      .string()
      .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename')
      .refine((v) => !v.includes('..') && !v.includes('/') && !v.includes('\\'), 'Invalid filename'),
  }),
});

export function validateGetImage(req: Request, res: Response, next: NextFunction) {
  try {
    getImageSchema.parse({ params: req.params });
    return next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', errors: err.issues });
    }
    return next(err);
  }
}
