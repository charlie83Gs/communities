import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { communityController } from '../controllers/community.controller';
import {
  validateCreateCommunity,
  validateUpdateCommunity,
  validateGetCommunity,
  validateListCommunities,
  validateGetMembers,
  validateGetMemberById,
  validateRemoveMember,
  validateUpdateMemberRole,
  validateCommunitySearchQuery,
} from '../validators/community.validator';

const router = Router();

/**
 * Public endpoints (no RBAC):
 * - GET / (list public; if Authorization token present, also include user-accessible via membership/policies)
 * - GET /search (search with filters; public + user-accessible private if token present)
 * - GET /:id (public communities are open; private require session + explicit access handled in service)
 * Note: verifyTokenOptional attaches session when a valid token is provided,
 * allowing the controller to read req.session on public routes.
 */
router.get(
  '/',
  verifyTokenOptional,
  validateListCommunities,
  communityController.list
);
// Place before '/:id' to avoid route conflict with 'search'
router.get(
  '/search',
  verifyTokenOptional,
  validateCommunitySearchQuery,
  communityController.search
);
router.get(
  '/:id',
  verifyTokenOptional,
  validateGetCommunity,
  communityController.getById
);

/**
 * Authenticated endpoints (session required, no RBAC on create):
 * - POST / (create community is open/global: no RBAC role needed)
 * Ensure app_users entry exists before we insert rows that FK to it.
 */
router.post('/', verifyToken, validateCreateCommunity, communityController.create);

/**
 * Authenticated + business-rule protected by service (e.g., admin of community):
 * - PUT /:id
 * - DELETE /:id
 * Ensure app_users presence for FK safety on membership operations.
 */
router.put('/:id', verifyToken, validateUpdateCommunity, communityController.update);
router.delete('/:id', verifyToken, communityController.delete);

/**
 * Members endpoints (admin-only via service check)
 * - GET /:id/members (list members)
 * - DELETE /:id/members/:userId (remove member)
 * - PUT /:id/members/:userId (update role)
 */
router.get('/:id/members', verifyToken, validateGetMembers, communityController.getMembers);
router.get('/:id/members/:userId', verifyToken, validateGetMemberById, communityController.getMemberById);
router.delete('/:id/members/:userId', verifyToken, validateRemoveMember, communityController.removeMember);
router.put('/:id/members/:userId', verifyToken, validateUpdateMemberRole, communityController.updateMemberRole);

export default router;