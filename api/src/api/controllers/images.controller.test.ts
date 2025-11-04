import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { imagesController } from './images.controller';
import { imagesService } from '@/services/images.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  createMockFile,
} from '../../../tests/helpers/testUtils';
import { Readable } from 'stream';

// Mock the service
const mockImagesService = {
  save: mock(() => Promise.resolve({
    id: 'test-image-id',
    filename: 'test-image.webp',
    contentType: 'image/webp',
    bytes: 1024,
    width: 512,
    height: 512,
  })),
  getReadStream: mock(() => Readable.from(['test'])),
  getContentType: mock(() => 'image/webp'),
};

describe('ImagesController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockImagesService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    (imagesService.save as any) = mockImagesService.save;
    (imagesService.getReadStream as any) = mockImagesService.getReadStream;
    (imagesService.getContentType as any) = mockImagesService.getContentType;
  });

  describe('upload', () => {
    test('should upload image successfully', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024);
      const req = createMockAuthenticatedRequest('user-123', {});
      (req as any).file = mockFile;
      const res = createMockResponse();
      const next = createMockNext();

      const savedImage = {
        id: 'test-image-id',
        filename: 'test-image.webp',
        contentType: 'image/webp',
        bytes: 1024,
        width: 512,
        height: 512,
      };
      mockImagesService.save.mockResolvedValue(savedImage);

      await imagesController.upload(req, res, next);

      expect(mockImagesService.save).toHaveBeenCalledWith(mockFile.buffer, mockFile.mimetype);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: savedImage,
        message: 'Image uploaded successfully',
      });
    });

    test('should handle errors', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024);
      const req = createMockAuthenticatedRequest('user-123', {});
      (req as any).file = mockFile;
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Storage error');
      mockImagesService.save.mockRejectedValue(error);

      await imagesController.upload(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getByFilename', () => {
    test('should retrieve image successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { filename: 'test-image.webp' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const mockStream = Readable.from(['test image data']);
      mockImagesService.getReadStream.mockReturnValue(mockStream);
      mockImagesService.getContentType.mockReturnValue('image/webp');

      // Mock pipe method
      mockStream.pipe = mock((dest: any) => dest);

      await imagesController.getByFilename(req, res, next);

      expect(mockImagesService.getReadStream).toHaveBeenCalledWith('test-image.webp');
      expect(mockImagesService.getContentType).toHaveBeenCalledWith('test-image.webp');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/webp');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, max-age=60');
      expect(mockStream.pipe).toHaveBeenCalledWith(res);
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { filename: 'nonexistent.webp' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('File not found');
      mockImagesService.getReadStream.mockImplementation(() => {
        throw error;
      });

      await imagesController.getByFilename(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
