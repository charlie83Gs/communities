import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Helper function for validation
function handleZod(parse: () => unknown, res: Response, next: NextFunction) {
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

// Schema definitions

const reportItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createUsageReportSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(10),
    items: z.array(reportItemSchema).optional(),
  }),
}).passthrough();

export const getUsageReportSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    reportId: z.string().uuid(),
  }),
}).passthrough();

export const listUsageReportsSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

export const updateUsageReportSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    reportId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(10).optional(),
    items: z.array(reportItemSchema).optional(),
  }).refine(
    (data) => data.title !== undefined || data.content !== undefined || data.items !== undefined,
    {
      message: 'At least one field (title, content, or items) must be provided',
    }
  ),
}).passthrough();

export const deleteUsageReportSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    reportId: z.string().uuid(),
  }),
}).passthrough();

export const addAttachmentSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    reportId: z.string().uuid(),
  }),
}).passthrough();

export const removeAttachmentSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    councilId: z.string().uuid(),
    reportId: z.string().uuid(),
    attachmentId: z.string().uuid(),
  }),
}).passthrough();

// Validator middleware functions

export const validateCreateUsageReport = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createUsageReportSchema.parse(req), res, next);

export const validateGetUsageReport = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getUsageReportSchema.parse(req), res, next);

export const validateListUsageReports = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listUsageReportsSchema.parse(req), res, next);

export const validateUpdateUsageReport = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateUsageReportSchema.parse(req), res, next);

export const validateDeleteUsageReport = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => deleteUsageReportSchema.parse(req), res, next);

export const validateAddAttachment = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => addAttachmentSchema.parse(req), res, next);

export const validateRemoveAttachment = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => removeAttachmentSchema.parse(req), res, next);
