import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors';

// ========== Pool Checkout Links ==========

export const createPoolCheckoutLinkSchema = z.object({
  body: z.object({
    itemId: z.string().uuid('Item ID must be a valid UUID'),
    maxUnitsPerCheckout: z.number().positive('Max units per checkout must be positive').optional().nullable(),
  }),
});

export const revokePoolCheckoutLinkSchema = z.object({
  body: z.object({
    reason: z.string().max(500, 'Revoke reason must be less than 500 characters').optional(),
  }),
});

// ========== Share Checkout Links ==========

export const createShareCheckoutLinkSchema = z.object({
  body: z.object({
    maxUnitsPerCheckout: z.number().positive('Max units per checkout must be positive').optional().nullable(),
  }),
});

// ========== Public Checkout ==========

export const completeCheckoutSchema = z.object({
  body: z.object({
    units: z.number().positive('Units must be a positive number'),
  }),
});

// ========== Validator Middleware Functions ==========

export function validateCreatePoolCheckoutLink(req: Request, _res: Response, next: NextFunction) {
  try {
    createPoolCheckoutLinkSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0].message, 400));
    } else {
      next(error);
    }
  }
}

export function validateRevokePoolCheckoutLink(req: Request, _res: Response, next: NextFunction) {
  try {
    revokePoolCheckoutLinkSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0].message, 400));
    } else {
      next(error);
    }
  }
}

export function validateCreateShareCheckoutLink(req: Request, _res: Response, next: NextFunction) {
  try {
    createShareCheckoutLinkSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0].message, 400));
    } else {
      next(error);
    }
  }
}

export function validateCompleteCheckout(req: Request, _res: Response, next: NextFunction) {
  try {
    completeCheckoutSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.issues[0].message, 400));
    } else {
      next(error);
    }
  }
}
