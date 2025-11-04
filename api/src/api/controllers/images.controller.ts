import type { Request, Response, NextFunction } from 'express';
import { imagesService } from '@services/images.service';
import { ApiResponse } from '@utils/response';

/**
 * @swagger
 * components:
 *   schemas:
 *     SavedImage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Server-generated identifier (may be filename without extension)
 *         filename:
 *           type: string
 *           example: "b6f1f1b0-8c0e-4b2b-8f3d-2b62e6a1c9b2.webp"
 *         contentType:
 *           type: string
 *           example: "image/webp"
 *         bytes:
 *           type: integer
 *           example: 48213
 *         width:
 *           type: integer
 *           example: 512
 *         height:
 *           type: integer
 *           example: 512
 *       example:
 *         id: "b6f1f1b0-8c0e-4b2b-8f3d-2b62e6a1c9b2"
 *         filename: "b6f1f1b0-8c0e-4b2b-8f3d-2b62e6a1c9b2.webp"
 *         contentType: "image/webp"
 *         bytes: 48213
 *         width: 512
 *         height: 512
 */
export class ImagesController {
  /**
   * @swagger
   * tags:
   *   - name: Images
   *     description: Image upload and retrieval
   */

  /**
   * @swagger
   * /api/v1/images:
   *   post:
   *     summary: Upload an image
   *     description: Accepts an image file and stores a processed WebP version on disk. Requires authentication, no RBAC role.
   *     tags: [Images]
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
   *         description: Image uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     filename:
   *                       type: string
   *                       example: "b6f1f1b0-8c0e-4b2b-8f3d-2b62e6a1c9b2.webp"
   *                     contentType:
   *                       type: string
   *                       example: "image/webp"
   *                     bytes:
   *                       type: number
   *                     width:
   *                       type: number
   *                     height:
   *                       type: number
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file as any | undefined;
      // validator ensures file presence and size
      const saved = await imagesService.save(file.buffer, file.mimetype);
      return ApiResponse.created(res, saved, 'Image uploaded successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/images/{filename}:
   *   get:
   *     summary: Retrieve an image by filename
   *     description: Streams the stored image. Requires authentication, no RBAC role.
   *     tags: [Images]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: filename
   *         required: true
   *         schema:
   *           type: string
   *           example: "b6f1f1b0-8c0e-4b2b-8f3d-2b62e6a1c9b2.webp"
   *     responses:
   *       200:
   *         description: Image stream
   *         content:
   *           image/webp:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Not found
   */
  async getByFilename(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params as { filename: string };
      const stream = imagesService.getReadStream(filename);
      const contentType = imagesService.getContentType(filename);
      res.setHeader('Content-Type', contentType);
      // Optional: short cache to reduce load (tune as needed)
      res.setHeader('Cache-Control', 'private, max-age=60');
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

export const imagesController = new ImagesController();