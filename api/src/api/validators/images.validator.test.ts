import { describe, it, expect } from 'bun:test';
import {
  validateUploadImage,
  validateGetImage,
} from '@/api/validators/images.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('Images Validators', () => {
  describe('validateUploadImage', () => {
    it('should pass with valid image file', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test image data'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        originalname: 'test-image.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with PNG image', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test png data'),
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
        originalname: 'photo.png',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with WebP image', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test webp data'),
        mimetype: 'image/webp',
        size: 500 * 1024, // 500KB
        originalname: 'image.webp',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when no file is provided', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Image file is required (field: image)',
      });
    });

    it('should fail with file larger than 10MB', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.alloc(11 * 1024 * 1024), // 11MB
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024,
        originalname: 'large-image.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['file', 'size']),
          }),
        ]),
      });
    });

    it('should fail with empty filename', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test image data'),
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: '',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass at exactly 10MB boundary', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.alloc(10 * 1024 * 1024),
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // Exactly 10MB
        originalname: 'boundary.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with very small file', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('x'),
        mimetype: 'image/gif',
        size: 1, // 1 byte
        originalname: 'tiny.gif',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateGetImage', () => {
    it('should pass with valid filename', () => {
      const req = createMockRequest({
        params: { filename: 'test-image.jpg' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with alphanumeric filename', () => {
      const req = createMockRequest({
        params: { filename: 'image123.png' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with dashes and underscores', () => {
      const req = createMockRequest({
        params: { filename: 'my-test_image.webp' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with UUID-like filename', () => {
      const req = createMockRequest({
        params: { filename: '123e4567-e89b-12d3-a456-426614174000.jpg' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with path traversal attempt (..)', () => {
      const req = createMockRequest({
        params: { filename: '../etc/passwd' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['params', 'filename']),
          }),
        ]),
      });
    });

    it('should fail with forward slash in filename', () => {
      const req = createMockRequest({
        params: { filename: 'test/image.jpg' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with backslash in filename', () => {
      const req = createMockRequest({
        params: { filename: 'test\\image.jpg' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with special characters', () => {
      const req = createMockRequest({
        params: { filename: 'test@image!.jpg' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with spaces in filename', () => {
      const req = createMockRequest({
        params: { filename: 'test image.jpg' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with empty filename', () => {
      const req = createMockRequest({
        params: { filename: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with missing filename', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
