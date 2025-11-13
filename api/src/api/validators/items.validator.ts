import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation schemas for items endpoints
 */

const itemKindEnum = z.enum(['object', 'service']);
const supportedLanguageEnum = z.enum(['en', 'es', 'hi']);

// Translation schema for a single language
const itemTranslationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
  description: z.string().optional(),
});

// Translations object - at least 'en' is required
const itemTranslationsSchema = z.object({
  en: itemTranslationSchema,
  es: itemTranslationSchema.optional(),
  hi: itemTranslationSchema.optional(),
});

export const createItemSchema = z.object({
  body: z.object({
    communityId: z.string().uuid('Community ID must be a valid UUID'),
    translations: itemTranslationsSchema,
    kind: itemKindEnum,
    wealthValue: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Wealth value must be a valid number with up to 2 decimal places')
      .refine((val) => {
        const num = parseFloat(val);
        return num > 0 && num <= 10000;
      }, 'Wealth value must be greater than 0 and less than or equal to 10000'),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Item ID must be a valid UUID'),
  }),
  body: z.object({
    translations: itemTranslationsSchema.partial().optional(),
    kind: itemKindEnum.optional(),
    wealthValue: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Wealth value must be a valid number with up to 2 decimal places')
      .refine((val) => {
        const num = parseFloat(val);
        return num > 0 && num <= 10000;
      }, 'Wealth value must be greater than 0 and less than or equal to 10000')
      .optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Item ID must be a valid UUID'),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    communityId: z.string().uuid('Community ID must be a valid UUID'),
    language: supportedLanguageEnum.optional().default('en'),
    includeDeleted: z.string().optional().transform((val) => val === 'true'),
  }),
});

export const searchQuerySchema = z.object({
  query: z.object({
    communityId: z.string().uuid('Community ID must be a valid UUID'),
    language: supportedLanguageEnum.optional().default('en'),
    query: z.string().optional(),
    kind: itemKindEnum.optional(),
  }),
});

/**
 * Middleware validators
 */

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

export const validateCreateItem = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createItemSchema.parse(req), res, next);

export const validateUpdateItem = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateItemSchema.parse(req), res, next);

export const validateIdParam = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => idParamSchema.parse(req), res, next);

export const validateListQuery = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listQuerySchema.parse(req), res, next);

export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => searchQuerySchema.parse(req), res, next);
