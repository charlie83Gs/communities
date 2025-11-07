import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const uuidSchema = z.string().uuid();

export const getEventsForUserSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
  }),
  query: z.object({
    userId: uuidSchema,
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  }),
});

export const getTrustViewSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    userId: uuidSchema,
  }),
});

export const listCommunityTrustSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  }),
});

export const getTrustMeSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
  }),
});

// New: global user-scoped endpoints (no community param)
export const listMyEventsAllCommunitiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  }),
});

export const listMyTrustAcrossCommunitiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  }),
});

// Middlewares
function handleZod(parseResult: any, res: Response, next: NextFunction) {
  try {
    parseResult;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        issues: error.issues,
      });
    }
    next(error);
  }
}

export const validateGetEventsForUser = (req: Request, res: Response, next: NextFunction) =>
  handleZod(getEventsForUserSchema.parse(req), res, next);

export const validateGetTrustView = (req: Request, res: Response, next: NextFunction) =>
  handleZod(getTrustViewSchema.parse(req), res, next);

export const validateListCommunityTrust = (req: Request, res: Response, next: NextFunction) =>
  handleZod(listCommunityTrustSchema.parse(req), res, next);

export const validateGetTrustMe = (req: Request, res: Response, next: NextFunction) =>
  handleZod(getTrustMeSchema.parse(req), res, next);

// New validators
export const validateListMyEventsAllCommunities = (req: Request, res: Response, next: NextFunction) =>
  handleZod(listMyEventsAllCommunitiesSchema.parse(req), res, next);

export const validateListMyTrustAcrossCommunities = (req: Request, res: Response, next: NextFunction) =>
  handleZod(listMyTrustAcrossCommunitiesSchema.parse(req), res, next);

// ========== TRUST AWARD VALIDATORS ==========

export const awardTrustSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    toUserId: uuidSchema,
  }),
});

export const removeTrustSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    toUserId: uuidSchema,
  }),
});

export const listMyAwardsSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
  }),
});

export const listAwardsToUserSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    userId: uuidSchema,
  }),
});

export const getTrustHistorySchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    userId: uuidSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  }),
});

// ========== ADMIN GRANT VALIDATORS ==========

export const setAdminGrantSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    toUserId: uuidSchema,
  }),
  body: z.object({
    amount: z.number().int().min(0),
  }),
});

export const getAdminGrantsSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
  }),
});

export const deleteAdminGrantSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
    toUserId: uuidSchema,
  }),
});

// Validator middlewares for new endpoints
export const validateAwardTrust = (req: Request, res: Response, next: NextFunction) =>
  handleZod(awardTrustSchema.parse(req), res, next);

export const validateRemoveTrust = (req: Request, res: Response, next: NextFunction) =>
  handleZod(removeTrustSchema.parse(req), res, next);

export const validateListMyAwards = (req: Request, res: Response, next: NextFunction) =>
  handleZod(listMyAwardsSchema.parse(req), res, next);

export const validateListAwardsToUser = (req: Request, res: Response, next: NextFunction) =>
  handleZod(listAwardsToUserSchema.parse(req), res, next);

export const validateGetTrustHistory = (req: Request, res: Response, next: NextFunction) =>
  handleZod(getTrustHistorySchema.parse(req), res, next);

export const validateSetAdminGrant = (req: Request, res: Response, next: NextFunction) =>
  handleZod(setAdminGrantSchema.parse(req), res, next);

export const validateGetAdminGrants = (req: Request, res: Response, next: NextFunction) =>
  handleZod(getAdminGrantsSchema.parse(req), res, next);

export const validateDeleteAdminGrant = (req: Request, res: Response, next: NextFunction) =>
  handleZod(deleteAdminGrantSchema.parse(req), res, next);

// ========== TRUST TIMELINE VALIDATOR ==========

export const getTrustTimelineSchema = z.object({
  params: z.object({
    communityId: uuidSchema,
  }),
});

export const validateGetTrustTimeline = (req: Request, res: Response, next: NextFunction) =>
  handleZod(getTrustTimelineSchema.parse(req), res, next);
