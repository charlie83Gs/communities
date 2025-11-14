import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ===== SCHEMAS =====

export const createDisputeSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    participantIds: z.array(z.string()).optional(),
  }),
}).passthrough();

export const getDisputeSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
}).passthrough();

export const listDisputesSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    status: z.enum(['open', 'in_mediation', 'resolved', 'closed']).optional(),
  }),
}).passthrough();

export const addParticipantSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
  body: z.object({
    userId: z.string(),
  }),
}).passthrough();

export const proposeMediatorSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
}).passthrough();

export const respondToMediatorSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
    mediatorId: z.string().uuid(),
  }),
  body: z.object({
    accept: z.boolean(),
  }),
}).passthrough();

export const createResolutionSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
  body: z.object({
    resolutionType: z.enum(['open', 'closed']),
    resolution: z.string().min(1),
  }),
}).passthrough();

export const createMessageSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
  body: z.object({
    message: z.string().min(1),
    visibleToParticipants: z.boolean().optional(),
    visibleToMediators: z.boolean().optional(),
  }),
}).passthrough();

export const getMessagesSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
}).passthrough();

export const updateDisputeStatusSchema = z.object({
  params: z.object({
    communityId: z.string().uuid(),
    disputeId: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['open', 'in_mediation', 'resolved', 'closed']),
  }),
}).passthrough();

// ===== MIDDLEWARE FUNCTIONS =====

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

export const validateCreateDispute = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createDisputeSchema.parse(req), res, next);

export const validateGetDispute = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getDisputeSchema.parse(req), res, next);

export const validateListDisputes = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => listDisputesSchema.parse(req), res, next);

export const validateAddParticipant = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => addParticipantSchema.parse(req), res, next);

export const validateProposeMediator = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => proposeMediatorSchema.parse(req), res, next);

export const validateRespondToMediator = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => respondToMediatorSchema.parse(req), res, next);

export const validateCreateResolution = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createResolutionSchema.parse(req), res, next);

export const validateCreateMessage = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => createMessageSchema.parse(req), res, next);

export const validateGetMessages = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => getMessagesSchema.parse(req), res, next);

export const validateUpdateDisputeStatus = (req: Request, res: Response, next: NextFunction) =>
  handleZod(() => updateDisputeStatusSchema.parse(req), res, next);
