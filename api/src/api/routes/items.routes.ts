import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { itemsController } from '@api/controllers/items.controller';
import * as validators from '@api/validators/items.validator';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/v1/items - List items for a community
router.get(
  '/',
  validators.validateListQuery,
  itemsController.list.bind(itemsController)
);

// GET /api/v1/items/search - Search items
router.get(
  '/search',
  validators.validateSearchQuery,
  itemsController.search.bind(itemsController)
);

// GET /api/v1/items/permissions/can-manage - Check item management permission
router.get(
  '/permissions/can-manage',
  validators.validateListQuery,
  itemsController.canManage.bind(itemsController)
);

// POST /api/v1/items - Create item
router.post(
  '/',
  validators.validateCreateItem,
  itemsController.create.bind(itemsController)
);

// GET /api/v1/items/:id - Get single item
router.get(
  '/:id',
  validators.validateIdParam,
  itemsController.getById.bind(itemsController)
);

// PUT /api/v1/items/:id - Update item
router.put(
  '/:id',
  validators.validateUpdateItem,
  itemsController.update.bind(itemsController)
);

// DELETE /api/v1/items/:id - Soft delete item
router.delete(
  '/:id',
  validators.validateIdParam,
  itemsController.delete.bind(itemsController)
);

export default router;
