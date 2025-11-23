import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { itemsService } from '@services/items.service';
import { ApiResponse } from '@utils/response';

export class ItemsController {
  /**
   * @swagger
   * /api/v1/items:
   *   get:
   *     summary: List items for a community
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: language
   *         schema:
   *           type: string
   *           enum: [en, es, hi]
   *           default: en
   *         description: Language for item names/descriptions
   *       - in: query
   *         name: includeDeleted
   *         schema:
   *           type: boolean
   *         description: Include soft-deleted items
   *     responses:
   *       200:
   *         description: List of items with wealth counts
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const { communityId, language = 'en', includeDeleted } = req.query;

      const items = await itemsService.listItems(
        communityId as string,
        userId,
        language as 'en' | 'es' | 'hi',
        includeDeleted === 'true'
      );

      return ApiResponse.success(res, items);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/items/{id}:
   *   get:
   *     summary: Get item by ID
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Item ID
   *       - in: query
   *         name: language
   *         schema:
   *           type: string
   *           enum: [en, es, hi]
   *           default: en
   *         description: Language for item names/descriptions
   *     responses:
   *       200:
   *         description: Item details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   *       404:
   *         description: Item not found
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const { id } = req.params;
      const { language = 'en' } = req.query;

      const item = await itemsService.getItemById(id, userId, language as 'en' | 'es' | 'hi');

      return ApiResponse.success(res, item);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/items:
   *   post:
   *     summary: Create a new item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - communityId
   *               - translations
   *               - kind
   *               - wealthValue
   *             properties:
   *               communityId:
   *                 type: string
   *                 format: uuid
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *               translations:
   *                 type: object
   *                 required:
   *                   - en
   *                 properties:
   *                   en:
   *                     type: object
   *                     required:
   *                       - name
   *                     properties:
   *                       name:
   *                         type: string
   *                         minLength: 1
   *                         maxLength: 200
   *                         example: "Carrots"
   *                       description:
   *                         type: string
   *                         example: "Fresh organic carrots"
   *                   es:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         example: "Zanahorias"
   *                       description:
   *                         type: string
   *                         example: "Zanahorias orgánicas frescas"
   *                   hi:
   *                     type: object
   *                     properties:
   *                       name:
   *                         type: string
   *                         example: "गाजर"
   *                       description:
   *                         type: string
   *                         example: "ताजा जैविक गाजर"
   *               kind:
   *                 type: string
   *                 enum: [object, service]
   *                 example: "object"
   *               wealthValue:
   *                 type: string
   *                 pattern: '^\d+(\.\d{1,2})?$'
   *                 minimum: 0.01
   *                 maximum: 10000
   *                 example: "5.00"
   *                 description: "Numeric value for aggregate wealth statistics (positive number with up to 2 decimal places)"
   *     responses:
   *       201:
   *         description: Item created successfully
   *       400:
   *         description: Validation error or duplicate name
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - insufficient permissions
   *       404:
   *         description: Community not found
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const item = await itemsService.createItem(req.body, userId);

      return ApiResponse.created(res, item, 'Item created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/items/{id}:
   *   put:
   *     summary: Update an item
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Item ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *                 example: "Organic Carrots"
   *               description:
   *                 type: string
   *                 nullable: true
   *                 example: "Fresh organic carrots from local farm"
   *               kind:
   *                 type: string
   *                 enum: [object, service]
   *                 example: "object"
   *               wealthValue:
   *                 type: string
   *                 pattern: '^\d+(\.\d{1,2})?$'
   *                 minimum: 0.01
   *                 maximum: 10000
   *                 example: "5.00"
   *                 description: "Numeric value for aggregate wealth statistics (optional for updates)"
   *     responses:
   *       200:
   *         description: Item updated successfully
   *       400:
   *         description: Validation error or duplicate name
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - insufficient permissions
   *       404:
   *         description: Item not found
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const { id } = req.params;

      const item = await itemsService.updateItem(id, req.body, userId);

      return ApiResponse.success(res, item, 'Item updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/items/{id}:
   *   delete:
   *     summary: Delete an item (soft delete)
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Item ID
   *     responses:
   *       200:
   *         description: Item deleted successfully
   *       400:
   *         description: Cannot delete default items or items with active wealth
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - insufficient permissions
   *       404:
   *         description: Item not found
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const { id } = req.params;

      await itemsService.deleteItem(id, userId);

      return ApiResponse.success(res, null, 'Item deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/items/search:
   *   get:
   *     summary: Search items by name or description
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: language
   *         schema:
   *           type: string
   *           enum: [en, es, hi]
   *           default: en
   *         description: Language to search in
   *       - in: query
   *         name: query
   *         schema:
   *           type: string
   *         description: Search query (matches name or description)
   *       - in: query
   *         name: kind
   *         schema:
   *           type: string
   *           enum: [object, service]
   *         description: Filter by item kind
   *     responses:
   *       200:
   *         description: List of matching items
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   */
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const { communityId, language = 'en', query, kind } = req.query;

      const items = await itemsService.searchItems(
        communityId as string,
        userId,
        language as 'en' | 'es' | 'hi',
        query as string | undefined,
        kind as 'object' | 'service' | undefined
      );

      return ApiResponse.success(res, items);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/items/permissions/can-manage:
   *   get:
   *     summary: Check if user can manage items in a community
   *     tags: [Items]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Permission check result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 canManage:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  async canManage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const { communityId } = req.query;

      if (!communityId || typeof communityId !== 'string') {
        return ApiResponse.error(res, 'Community ID is required', 400);
      }

      const canManage = await itemsService.canManageItems(userId, communityId);

      return ApiResponse.success(res, { canManage });
    } catch (err) {
      next(err);
    }
  }
}

export const itemsController = new ItemsController();
