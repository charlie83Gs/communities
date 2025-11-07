import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { userPreferencesService } from '@/services/userPreferences.service';
import { appUserRepository } from '@repositories/appUser.repository';
import { imagesService } from '@/services/images.service';
import { AppError } from '@/utils/errors';
import { testData } from '../../tests/helpers/testUtils';

const mockAppUserRepository = {
  findById: mock(() =>
    Promise.resolve({
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      country: 'USA',
      stateProvince: 'CA',
      city: 'San Francisco',
      description: 'Test description',
      profileImage: 'image.webp',
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
  update: mock(() =>
    Promise.resolve({
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      country: 'USA',
      stateProvince: 'CA',
      city: 'San Francisco',
      description: 'Test description',
      profileImage: 'image.webp',
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
};

const mockImagesService = {
  save: mock(() =>
    Promise.resolve({
      id: 'img-123',
      filename: 'new-image.webp',
      contentType: 'image/webp',
      bytes: 1024,
      width: 800,
      height: 600,
    })
  ),
};

describe('UserPreferencesService', () => {
  beforeEach(() => {
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockImagesService).forEach((m) => m.mockReset());

    (appUserRepository.findById as any) = mockAppUserRepository.findById;
    (appUserRepository.update as any) = mockAppUserRepository.update;
    (imagesService.save as any) = mockImagesService.save;
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      // Reconfigure mocks for this test
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: 'USA',
        stateProvince: 'CA',
        city: 'San Francisco',
        description: 'Test description',
        profileImage: 'image.webp',
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userPreferencesService.getPreferences('user-123');

      expect(result.displayName).toBe('Test User');
      expect(result.country).toBe('USA');
      expect(result.stateProvince).toBe('CA');
      expect(result.city).toBe('San Francisco');
      expect(result.description).toBe('Test description');
      expect(result.profileImage).toBe('image.webp');
      expect(mockAppUserRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw error if user not found', async () => {
      mockAppUserRepository.findById.mockResolvedValue(undefined);

      await expect(userPreferencesService.getPreferences('user-123')).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle null preference fields', async () => {
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: null,
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userPreferencesService.getPreferences('user-123');

      expect(result.displayName).toBeUndefined();
      expect(result.country).toBeUndefined();
      expect(result.profileImage).toBeUndefined();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      // Reconfigure mocks for this test
      mockAppUserRepository.update.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Updated User',
        country: 'Canada',
        stateProvince: 'CA',
        city: 'Toronto',
        description: 'Test description',
        profileImage: 'image.webp',
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updateData = {
        displayName: 'Updated User',
        country: 'Canada',
        city: 'Toronto',
      };

      const result = await userPreferencesService.updatePreferences('user-123', updateData);

      expect(result.displayName).toBe('Updated User');
      expect(mockAppUserRepository.update).toHaveBeenCalledWith('user-123', updateData);
    });

    it('should throw error if user not found', async () => {
      mockAppUserRepository.update.mockResolvedValue(undefined);

      await expect(
        userPreferencesService.updatePreferences('user-123', {
          displayName: 'Updated',
        })
      ).rejects.toThrow('User not found');
    });

    it('should handle partial updates', async () => {
      // Reconfigure mocks for this test
      mockAppUserRepository.update.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: 'USA',
        stateProvince: 'CA',
        city: 'San Francisco',
        description: 'New description only',
        profileImage: 'image.webp',
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userPreferencesService.updatePreferences('user-123', {
        description: 'New description only',
      });

      expect(mockAppUserRepository.update).toHaveBeenCalledWith('user-123', {
        description: 'New description only',
      });
    });
  });

  describe('uploadAndSetProfileImage', () => {
    it('should upload image and update profile', async () => {
      // Reconfigure mocks for this test
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockImagesService.save.mockResolvedValue({
        id: 'img-123',
        filename: 'new-image.webp',
        contentType: 'image/webp',
        bytes: 1024,
        width: 800,
        height: 600,
      });
      mockAppUserRepository.update.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: 'new-image.webp',
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const buffer = Buffer.from('fake-image-data');

      const result = await userPreferencesService.uploadAndSetProfileImage(
        'user-123',
        buffer,
        'image/png'
      );

      expect(result.filename).toBe('new-image.webp');
      expect(mockImagesService.save).toHaveBeenCalledWith(buffer, 'image/png');
      expect(mockAppUserRepository.update).toHaveBeenCalledWith('user-123', {
        profileImage: 'new-image.webp',
      });
    });

    it('should throw error if user not found', async () => {
      mockAppUserRepository.findById.mockResolvedValue(undefined);
      const buffer = Buffer.from('fake-image-data');

      await expect(
        userPreferencesService.uploadAndSetProfileImage('user-123', buffer)
      ).rejects.toThrow('User not found');
    });

    it('should handle image save errors', async () => {
      // Reconfigure mocks for this test
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockImagesService.save.mockRejectedValue(new Error('Image processing failed'));

      const buffer = Buffer.from('fake-image-data');

      await expect(
        userPreferencesService.uploadAndSetProfileImage('user-123', buffer)
      ).rejects.toThrow('Image processing failed');
    });
  });
});
