import { Router, type Request } from 'express';
import multer from 'multer';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { imagesController } from '@api/controllers/images.controller';
import { validateGetImage, validateUploadImage } from '@api/validators/images.validator';

// Multer memory storage since we pipe the buffer to sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: jpg, png, webp, gif'));
    }
  },
});

const router = Router();

/**
 * Auth note:
 * - No RBAC roles required
 * - Must be authenticated (verifySession)
 */

// Upload image (protected)
router.post('/', verifyToken, upload.single('image'), validateUploadImage, imagesController.upload);

// Get image by filename (allow anonymous in dev/first-load so frontend can render without auth)
router.get('/:filename', verifyTokenOptional, validateGetImage, imagesController.getByFilename);

export default router;
