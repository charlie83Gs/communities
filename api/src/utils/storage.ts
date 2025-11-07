import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');
export const IMAGES_DIR = path.join(UPLOADS_ROOT, 'images');

/**
 * Ensure uploads/images directory exists at runtime.
 * Call on module load.
 */
export function ensureImageStorage() {
  ensureDir(UPLOADS_ROOT);
  ensureDir(IMAGES_DIR);
}

export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generates a safe file name based on UUID and optional extension.
 */
export function generateFileName(ext?: string) {
  const id = randomUUID();
  const safeExt = normalizeExt(ext);
  return {
    id,
    filename: safeExt ? `${id}${safeExt}` : id,
  };
}

/**
 * Normalize extension to start with dot and be lowercase.
 */
export function normalizeExt(ext?: string | null) {
  if (!ext) return '';
  let e = ext.trim().toLowerCase();
  if (!e) return '';
  if (!e.startsWith('.')) e = `.${e}`;
  return e;
}

/**
 * Returns absolute path for a given filename under images dir.
 */
export function imageAbsPath(filename: string) {
  return path.join(IMAGES_DIR, filename);
}

/**
 * Very basic filename safety check to avoid path traversal.
 */
export function isSafeFileName(name: string) {
  // allow alphanum, dashes, underscores, dots and must contain a dot with an extension
  // disallow path separators
  return (
    /^[a-zA-Z0-9._-]+$/.test(name) &&
    !name.includes('..') &&
    !name.includes('/') &&
    !name.includes('\\')
  );
}

// Initialize dirs on module import
ensureImageStorage();
