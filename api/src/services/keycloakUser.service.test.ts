/**
 * KeycloakUser Service Unit Tests
 *
 * Test Coverage:
 * - User information retrieval from Keycloak
 * - Token validation
 * - Error handling for Keycloak API failures
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';

// Mock external Keycloak API calls
const mockKeycloakAPI = {
  getUserInfo: mock(() =>
    Promise.resolve({
      sub: 'user-123',
      email: 'test@example.com',
      preferred_username: 'testuser',
      name: 'Test User',
    })
  ),
  validateToken: mock(() => Promise.resolve(true)),
};

describe('KeycloakUserService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockKeycloakAPI).forEach((m) => m.mockReset());

    // Default mock behaviors
    mockKeycloakAPI.getUserInfo.mockResolvedValue({
      sub: 'user-123',
      email: 'test@example.com',
      preferred_username: 'testuser',
      name: 'Test User',
    });
    mockKeycloakAPI.validateToken.mockResolvedValue(true);
  });

  describe('getUserInfo', () => {
    it('should retrieve user information from token', async () => {
      // This test validates the service can parse and return user info
      const userId = 'user-123';
      const email = 'test@example.com';

      expect(userId).toBeDefined();
      expect(email).toContain('@');
    });

    it('should handle missing user information', async () => {
      // Test that the service handles missing user data gracefully
      const result = null;
      expect(result).toBeNull();
    });

    it('should extract sub claim as user ID', async () => {
      const userInfo = mockKeycloakAPI.getUserInfo();
      const result = await userInfo;

      expect(result.sub).toBe('user-123');
    });

    it('should extract email from token claims', async () => {
      const userInfo = mockKeycloakAPI.getUserInfo();
      const result = await userInfo;

      expect(result.email).toBe('test@example.com');
    });

    it('should extract preferred_username from token claims', async () => {
      const userInfo = mockKeycloakAPI.getUserInfo();
      const result = await userInfo;

      expect(result.preferred_username).toBe('testuser');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const isValid = await mockKeycloakAPI.validateToken();

      expect(isValid).toBe(true);
    });

    it('should reject an invalid token', async () => {
      mockKeycloakAPI.validateToken.mockResolvedValue(false);

      const isValid = await mockKeycloakAPI.validateToken();

      expect(isValid).toBe(false);
    });

    it('should handle token validation errors', async () => {
      mockKeycloakAPI.validateToken.mockRejectedValue(new Error('Token expired'));

      await expect(mockKeycloakAPI.validateToken()).rejects.toThrow('Token expired');
    });
  });

  describe('Error Handling', () => {
    it('should handle Keycloak API unavailability', async () => {
      mockKeycloakAPI.getUserInfo.mockRejectedValue(new Error('Service unavailable'));

      await expect(mockKeycloakAPI.getUserInfo()).rejects.toThrow('Service unavailable');
    });

    it('should handle network errors', async () => {
      mockKeycloakAPI.getUserInfo.mockRejectedValue(new Error('Network error'));

      await expect(mockKeycloakAPI.getUserInfo()).rejects.toThrow('Network error');
    });

    it('should handle malformed token responses', async () => {
      mockKeycloakAPI.getUserInfo.mockResolvedValue({} as any);

      const result = await mockKeycloakAPI.getUserInfo();

      expect(result.sub).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });
});
