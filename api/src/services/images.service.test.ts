import { describe, it, expect } from 'bun:test';
import { ImagesService } from './images.service';

/**
 * Limited test coverage for ImagesService due to Bun mocking limitations with sharp.
 * Testing only methods that don't require sharp mocking.
 */
describe('ImagesService', () => {
  const imagesService = new ImagesService();

  describe('getContentType', () => {
    it('should return webp content type for webp extension', () => {
      const result = imagesService.getContentType('image.webp');
      expect(result).toBe('image/webp');
    });

    it('should return jpeg content type for jpg extension', () => {
      const result = imagesService.getContentType('image.jpg');
      expect(result).toBe('image/jpeg');
    });

    it('should return jpeg content type for jpeg extension', () => {
      const result = imagesService.getContentType('image.jpeg');
      expect(result).toBe('image/jpeg');
    });

    it('should return png content type for png extension', () => {
      const result = imagesService.getContentType('image.png');
      expect(result).toBe('image/png');
    });

    it('should return gif content type for gif extension', () => {
      const result = imagesService.getContentType('image.gif');
      expect(result).toBe('image/gif');
    });

    it('should default to webp for unknown extension', () => {
      const result = imagesService.getContentType('image.unknown');
      expect(result).toBe('image/webp');
    });

    it('should handle uppercase extensions', () => {
      const result = imagesService.getContentType('IMAGE.PNG');
      expect(result).toBe('image/png');
    });

    it('should handle files without extension', () => {
      const result = imagesService.getContentType('image');
      expect(result).toBe('image/webp');
    });
  });
});
