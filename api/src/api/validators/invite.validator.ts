import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Valid community roles as defined in OpenFGA model
const validRoles = ['admin', 'member', 'reader'] as const;

export const createUserInviteSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  body: z.object({
    invitedUserId: z.string().uuid(),
    role: z.enum(validRoles, {
      message: 'Role must be one of: admin, member, reader',
    }),
  }),
});

export const createLinkInviteSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  body: z.object({
    role: z.enum(validRoles, {
      message: 'Role must be one of: admin, member, reader',
    }),
    title: z.string().min(1).max(128).optional(),
    expiresAt: z.string().datetime(),
  }),
});

export const cancelInviteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const redeemUserInviteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const redeemLinkInviteSchema = z.object({
  body: z.object({
    secret: z.string().min(1),
  }),
});

export const getUserInvitesSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
});

export const getLinkInvitesSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
});

export const deleteLinkInviteSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    id: z.string().uuid(),
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

export const validateCreateUserInvite = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createUserInviteSchema.parse(req), res, next);

export const validateCreateLinkInvite = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createLinkInviteSchema.parse(req), res, next);

export const validateCancelInvite = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => cancelInviteSchema.parse(req), res, next);

export const validateRedeemUserInvite = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => redeemUserInviteSchema.parse(req), res, next);

export const validateRedeemLinkInvite = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => redeemLinkInviteSchema.parse(req), res, next);

export const validateGetUserInvites = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getUserInvitesSchema.parse(req), res, next);

export const validateGetLinkInvites = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getLinkInvitesSchema.parse(req), res, next);

export const validateDeleteLinkInvite = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => deleteLinkInviteSchema.parse(req), res, next);
