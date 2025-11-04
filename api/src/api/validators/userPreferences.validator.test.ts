import { describe, it, expect } from 'bun:test';
import {
  validateUpdatePreferences,
  validateUploadProfileImage,
} from '@/api/validators/userPreferences.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('UserPreferences Validators', () => {
  describe('validateUpdatePreferences', () => {
    it('should pass with all valid fields', () => {
      const req = createMockRequest({
        body: {
          displayName: 'John Doe',
          country: 'US',
          stateProvince: 'California',
          city: 'San Francisco',
          description: 'Software developer and community enthusiast',
          profileImage: 'profile.jpg',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with partial update', () => {
      const req = createMockRequest({
        body: {
          displayName: 'Jane Smith',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with only location fields', () => {
      const req = createMockRequest({
        body: {
          country: 'CA',
          stateProvince: 'Ontario',
          city: 'Toronto',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with empty body (all optional)', () => {
      const req = createMockRequest({
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with description only', () => {
      const req = createMockRequest({
        body: {
          description: 'Updated bio information',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with empty displayName', () => {
      const req = createMockRequest({
        body: {
          displayName: '',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['body', 'displayName']),
          }),
        ]),
      });
    });

    it('should fail with displayName too long', () => {
      const req = createMockRequest({
        body: {
          displayName: 'a'.repeat(256),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with displayName at max length (255)', () => {
      const req = createMockRequest({
        body: {
          displayName: 'a'.repeat(255),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with country code not 2 characters', () => {
      const req = createMockRequest({
        body: {
          country: 'USA', // Should be 2 characters
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with country code too short', () => {
      const req = createMockRequest({
        body: {
          country: 'U',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with valid 2-letter country code', () => {
      const req = createMockRequest({
        body: {
          country: 'GB',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with stateProvince too long', () => {
      const req = createMockRequest({
        body: {
          stateProvince: 'a'.repeat(101),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with stateProvince at max length (100)', () => {
      const req = createMockRequest({
        body: {
          stateProvince: 'a'.repeat(100),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with city too long', () => {
      const req = createMockRequest({
        body: {
          city: 'a'.repeat(101),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with city at max length (100)', () => {
      const req = createMockRequest({
        body: {
          city: 'a'.repeat(100),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with long description', () => {
      const req = createMockRequest({
        body: {
          description: 'a'.repeat(1000), // No max length specified
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with empty description', () => {
      const req = createMockRequest({
        body: {
          description: '',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with profileImage path', () => {
      const req = createMockRequest({
        body: {
          profileImage: 'images/profile-123.jpg',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdatePreferences(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateUploadProfileImage', () => {
    it('should pass with valid JPEG image', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test image data'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        originalname: 'profile.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with valid PNG image', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test png data'),
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
        originalname: 'avatar.png',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with valid WebP image', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test webp data'),
        mimetype: 'image/webp',
        size: 500 * 1024, // 500KB
        originalname: 'profile.webp',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when no file is provided', () => {
      const req = createMockRequest({});
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Profile image file is required (field: image)',
      });
    });

    it('should fail with file larger than 5MB', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
        originalname: 'large-profile.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

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

    it('should pass at exactly 5MB boundary', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.alloc(5 * 1024 * 1024),
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024, // Exactly 5MB
        originalname: 'boundary.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
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

      validateUploadProfileImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
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

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with GIF image', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.from('test gif data'),
        mimetype: 'image/gif',
        size: 100 * 1024, // 100KB
        originalname: 'animated.gif',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with 4.9MB file', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.alloc(4.9 * 1024 * 1024),
        mimetype: 'image/png',
        size: 4.9 * 1024 * 1024,
        originalname: 'near-limit.png',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail just over 5MB', () => {
      const req = createMockRequest({});
      (req as any).file = {
        buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024 + 1,
        originalname: 'over-limit.jpg',
      };
      const res = createMockResponse();
      const next = createMockNext();

      validateUploadProfileImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
