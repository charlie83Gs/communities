import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { getPreferences, updatePreferences, uploadProfileImage } from './userPreferences.controller';
import { userPreferencesService } from '@/services/userPreferences.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  createMockFile,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockUserPreferencesService = {
  getPreferences: mock(() => Promise.resolve({
    displayName: 'Test User',
    country: 'US',
    city: 'San Francisco',
  })),
  updatePreferences: mock(() => Promise.resolve({
    displayName: 'Updated User',
    country: 'US',
    city: 'New York',
  })),
  uploadAndSetProfileImage: mock(() => Promise.resolve({
    id: 'profile-image-id',
    filename: 'profile.webp',
    contentType: 'image/webp',
    bytes: 2048,
    width: 256,
    height: 256,
  })),
};

describe('UserPreferencesController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockUserPreferencesService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    (userPreferencesService.getPreferences as any) = mockUserPreferencesService.getPreferences;
    (userPreferencesService.updatePreferences as any) = mockUserPreferencesService.updatePreferences;
    (userPreferencesService.uploadAndSetProfileImage as any) = mockUserPreferencesService.uploadAndSetProfileImage;
  });

  describe('getPreferences', () => {
    test('should get preferences successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {});
      const res = createMockResponse();
      const next = createMockNext();

      const mockPrefs = {
        displayName: 'Test User',
        country: 'US',
        city: 'San Francisco',
      };
      mockUserPreferencesService.getPreferences.mockResolvedValue(mockPrefs);

      await getPreferences(req, res, next);

      expect(mockUserPreferencesService.getPreferences).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockPrefs,
        message: 'Success',
      });
    });

    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await getPreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {});
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockUserPreferencesService.getPreferences.mockRejectedValue(error);

      await getPreferences(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updatePreferences', () => {
    test('should update preferences successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {
          displayName: 'Updated User',
          country: 'US',
          city: 'New York',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const updatedPrefs = {
        displayName: 'Updated User',
        country: 'US',
        city: 'New York',
      };
      mockUserPreferencesService.updatePreferences.mockResolvedValue(updatedPrefs);

      await updatePreferences(req, res, next);

      expect(mockUserPreferencesService.updatePreferences).toHaveBeenCalledWith('user-123', {
        displayName: 'Updated User',
        country: 'US',
        city: 'New York',
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedPrefs,
        message: 'Preferences updated successfully',
      });
    });

    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        user: undefined,
        body: { displayName: 'Test' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await updatePreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: { displayName: 'Test' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Update failed');
      mockUserPreferencesService.updatePreferences.mockRejectedValue(error);

      await updatePreferences(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadProfileImage', () => {
    test('should upload profile image successfully', async () => {
      const mockFile = createMockFile('profile.jpg', 'image/jpeg', 2048);
      const req = createMockAuthenticatedRequest('user-123', {});
      (req as any).file = mockFile;
      const res = createMockResponse();
      const next = createMockNext();

      const savedImage = {
        id: 'profile-image-id',
        filename: 'profile.webp',
        contentType: 'image/webp',
        bytes: 2048,
        width: 256,
        height: 256,
      };
      mockUserPreferencesService.uploadAndSetProfileImage.mockResolvedValue(savedImage);

      await uploadProfileImage(req, res, next);

      expect(mockUserPreferencesService.uploadAndSetProfileImage).toHaveBeenCalledWith(
        'user-123',
        mockFile.buffer,
        mockFile.mimetype
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: savedImage,
        message: 'Profile image uploaded and set successfully',
      });
    });

    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await uploadProfileImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized',
      });
    });

    test('should return 400 if file is missing', async () => {
      const req = createMockAuthenticatedRequest('user-123', {});
      (req as any).file = undefined;
      const res = createMockResponse();
      const next = createMockNext();

      await uploadProfileImage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Image file is required',
      });
    });

    test('should handle errors', async () => {
      const mockFile = createMockFile('profile.jpg', 'image/jpeg', 2048);
      const req = createMockAuthenticatedRequest('user-123', {});
      (req as any).file = mockFile;
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Upload failed');
      mockUserPreferencesService.uploadAndSetProfileImage.mockRejectedValue(error);

      await uploadProfileImage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
