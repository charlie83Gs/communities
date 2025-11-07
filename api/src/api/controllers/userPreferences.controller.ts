import { Request, Response, NextFunction } from 'express';
import { userPreferencesService } from '@/services/userPreferences.service';
import { ApiResponse } from '@/utils/response';
import { UpdateUserPreferencesDto } from '@/types/user.types';
import { SavedImage } from '@/services/images.service';

/**
 * @swagger
 * /api/v1/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 displayName:
 *                   type: string
 *                 description:
 *                   type: string
 *             example:
 *               displayName: "Ada Lovelace"
 *               description: "Software engineer interested in tech communities"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Unauthorized" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "User not found" }
 */
export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const preferences = await userPreferencesService.getPreferences(userId);
    return ApiResponse.success(res, preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: "Ada Lovelace"
 *               description:
 *                 type: string
 *                 example: "Software engineer interested in tech communities"
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 displayName:
 *                   type: string
 *                 description:
 *                   type: string
 *             example:
 *               displayName: "Ada Lovelace"
 *               description: "Software engineer interested in tech communities"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Validation error" }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "Unauthorized" }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 message: { type: string, example: "User not found" }
 */
export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const data: UpdateUserPreferencesDto = req.body;
    const preferences = await userPreferencesService.updatePreferences(userId, data);
    return ApiResponse.success(res, preferences, 'Preferences updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/users/preferences/profile-image:
 *   post:
 *     summary: Upload and set profile image
 *     description: Uploads a profile image, processes it to WebP, stores on disk, and sets the filename in user preferences. Requires authentication, no RBAC.
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Profile image uploaded and set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SavedImage'
 *       400:
 *         description: Validation error (e.g., file too large, invalid image)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const uploadProfileImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const file = (req as any).file as any | undefined;
    if (!file) {
      return res.status(400).json({ status: 'error', message: 'Image file is required' });
    }

    const saved: SavedImage = await userPreferencesService.uploadAndSetProfileImage(
      userId,
      file.buffer,
      file.mimetype
    );
    return ApiResponse.created(res, saved, 'Profile image uploaded and set successfully');
  } catch (error) {
    next(error);
  }
};
