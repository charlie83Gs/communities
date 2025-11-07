import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  imageAbsPath,
  generateFileName,
  normalizeExt,
  IMAGES_DIR,
  isSafeFileName,
} from '@utils/storage';
import { AppError } from '@utils/errors';

export type SavedImage = {
  id: string;
  filename: string;
  contentType: string;
  bytes: number;
  width: number;
  height: number;
};

/**
 * ImagesService handles saving and reading images from disk using sharp for processing.
 * Storage layout:
 *   uploads/images/<uuid>.webp  (normalized output)
 * Notes:
 *   - All images are converted to webp to normalize size and type.
 *   - Max dimensions are constrained to prevent abuse (defaults below).
 */
export class ImagesService {
  constructor(
    private readonly maxWidth = 1600,
    private readonly maxHeight = 1600,
    private readonly quality = 80
  ) {}

  /**
   * Save an image buffer to disk after processing with sharp (resize + convert to webp).
   * Returns metadata about the stored file.
   */
  async save(buffer: Buffer, originalMime?: string): Promise<SavedImage> {
    if (!buffer || buffer.length === 0) {
      throw new AppError('Empty image payload', 400);
    }

    // Use sharp to probe metadata and process
    const input = sharp(buffer, { failOn: 'none' });
    const meta = await input.metadata();

    // Resize if needed and convert to webp
    const processed = input
      .resize({
        width: this.maxWidth,
        height: this.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: this.quality });

    // Allocate filename
    const { id, filename } = generateFileName('.webp');
    const absPath = imageAbsPath(filename);

    // Ensure images dir exists (defensive, already created on import)
    await fs.promises.mkdir(IMAGES_DIR, { recursive: true });

    // Write file
    await processed.toFile(absPath);

    // Re-probe written file for final dimensions/size
    const finalMeta = await sharp(absPath).metadata();
    const stat = await fs.promises.stat(absPath);

    return {
      id,
      filename,
      contentType: 'image/webp',
      bytes: stat.size,
      width: finalMeta.width ?? meta.width ?? 0,
      height: finalMeta.height ?? meta.height ?? 0,
    };
  }

  /**
   * Get a readable stream for a stored image by filename.
   * Performs basic filename safety checks and ensures the file exists.
   */
  getReadStream(filename: string) {
    if (!filename || !isSafeFileName(filename)) {
      throw new AppError('Invalid image name', 400);
    }
    const absPath = imageAbsPath(filename);
    if (!absPath.startsWith(IMAGES_DIR + path.sep)) {
      // Prevent path traversal beyond IMAGES_DIR
      throw new AppError('Invalid image path', 400);
    }
    if (!fs.existsSync(absPath)) {
      throw new AppError('Image not found', 404);
    }
    return fs.createReadStream(absPath);
  }

  /**
   * Resolve content type based on extension, defaults to image/webp.
   */
  getContentType(filename: string) {
    const ext = normalizeExt(path.extname(filename));
    switch (ext) {
      case '.webp':
        return 'image/webp';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      default:
        return 'image/webp';
    }
  }
}

export const imagesService = new ImagesService();
