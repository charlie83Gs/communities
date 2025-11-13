import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth.middleware';
import { validateUpdatePreferences, validateUploadProfileImage } from '../validators/userPreferences.validator';
import { getPreferences, updatePreferences, uploadProfileImage } from '../controllers/userPreferences.controller';

const router = Router();

// Multer for profile image upload (memory storage, 5MB limit for profile pics)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB for profile images
  },
  fileFilter: (_req, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: jpg, png, webp, gif'));
    }
  },
});

// All routes require authentication
router.use(verifyToken);

router.get('/preferences', getPreferences);

router.put('/preferences', validateUpdatePreferences, updatePreferences);

router.post('/preferences/profile-image', upload.single('image'), validateUploadProfileImage, uploadProfileImage);

export default router;
