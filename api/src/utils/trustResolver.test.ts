import { describe, it, expect, beforeEach, mock } from 'bun:test';
import {
  resolveTrustRequirement,
  resolveTrustRequirementDetailed,
  validateTrustRequirement,
} from './trustResolver';
import { trustLevelRepository } from '../repositories/trustLevel.repository';

// Mock trustLevelRepository
const mockFindByName = mock(() => Promise.resolve(null));

describe('trustResolver', () => {
  beforeEach(() => {
    mockFindByName.mockReset();

    (trustLevelRepository.findByName as any) = mockFindByName;
  });

  describe('resolveTrustRequirement', () => {
    it('should return 0 for null requirement', async () => {
      const result = await resolveTrustRequirement('comm-123', null);
      expect(result).toBe(0);
    });

    it('should return 0 for undefined requirement', async () => {
      const result = await resolveTrustRequirement('comm-123', undefined);
      expect(result).toBe(0);
    });

    it('should handle backward compatibility with plain numbers', async () => {
      const result = await resolveTrustRequirement('comm-123', 15);
      expect(result).toBe(15);
    });

    it('should resolve numeric requirement', async () => {
      const requirement = { type: 'number', value: 20 };
      const result = await resolveTrustRequirement('comm-123', requirement);
      expect(result).toBe(20);
    });

    it('should resolve level requirement', async () => {
      const requirement = { type: 'level', value: 'Trusted' };
      mockFindByName.mockResolvedValue({
        id: 'level-123',
        communityId: 'comm-123',
        name: 'Trusted',
        threshold: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await resolveTrustRequirement('comm-123', requirement);
      expect(result).toBe(50);
      expect(mockFindByName).toHaveBeenCalledWith('comm-123', 'Trusted');
    });

    it('should throw error if trust level not found', async () => {
      const requirement = { type: 'level', value: 'NonExistent' };
      mockFindByName.mockResolvedValue(null);

      await expect(resolveTrustRequirement('comm-123', requirement)).rejects.toThrow(
        'Trust level "NonExistent" not found in community'
      );
    });

    it('should throw error for invalid requirement type', async () => {
      const requirement = { type: 'invalid', value: 10 };

      await expect(resolveTrustRequirement('comm-123', requirement)).rejects.toThrow(
        'Invalid trust requirement type'
      );
    });
  });

  describe('resolveTrustRequirementDetailed', () => {
    it('should resolve numeric requirement with details', async () => {
      const requirement = { type: 'number', value: 25 };

      const result = await resolveTrustRequirementDetailed('comm-123', requirement);

      expect(result).toEqual({
        type: 'number',
        value: 25,
        resolvedValue: 25,
      });
    });

    it('should resolve level requirement with details', async () => {
      const requirement = { type: 'level', value: 'Stable' };
      mockFindByName.mockResolvedValue({
        id: 'level-456',
        communityId: 'comm-123',
        name: 'Stable',
        threshold: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await resolveTrustRequirementDetailed('comm-123', requirement);

      expect(result).toEqual({
        type: 'level',
        value: 'Stable',
        resolvedValue: 10,
        levelName: 'Stable',
      });
      expect(mockFindByName).toHaveBeenCalledWith('comm-123', 'Stable');
    });

    it('should throw error for null/undefined requirement', async () => {
      await expect(resolveTrustRequirementDetailed('comm-123', null)).rejects.toThrow(
        'Invalid trust requirement'
      );
    });

    it('should throw error if trust level not found', async () => {
      const requirement = { type: 'level', value: 'Missing' };
      mockFindByName.mockResolvedValue(null);

      await expect(resolveTrustRequirementDetailed('comm-123', requirement)).rejects.toThrow(
        'Trust level "Missing" not found in community'
      );
    });

    it('should throw error for invalid requirement type', async () => {
      const requirement = { type: 'unknown', value: 'test' };

      await expect(resolveTrustRequirementDetailed('comm-123', requirement)).rejects.toThrow(
        'Invalid trust requirement type'
      );
    });
  });

  describe('validateTrustRequirement', () => {
    it('should validate numeric requirement', () => {
      const requirement = { type: 'number', value: 15 };
      expect(validateTrustRequirement(requirement)).toBe(true);
    });

    it('should validate level requirement', () => {
      const requirement = { type: 'level', value: 'Trusted' };
      expect(validateTrustRequirement(requirement)).toBe(true);
    });

    it('should throw error for null requirement', () => {
      expect(() => validateTrustRequirement(null)).toThrow('Trust requirement must be an object');
    });

    it('should throw error for non-object requirement', () => {
      expect(() => validateTrustRequirement(42)).toThrow('Trust requirement must be an object');
    });

    it('should throw error for invalid type', () => {
      expect(() => validateTrustRequirement({ type: 'invalid', value: 10 })).toThrow(
        'Trust requirement type must be "number" or "level"'
      );
    });

    it('should throw error for negative number value', () => {
      expect(() => validateTrustRequirement({ type: 'number', value: -5 })).toThrow(
        'Trust requirement value must be a non-negative number'
      );
    });

    it('should throw error for non-number value with number type', () => {
      expect(() => validateTrustRequirement({ type: 'number', value: 'not a number' })).toThrow(
        'Trust requirement value must be a non-negative number'
      );
    });

    it('should throw error for empty string value with level type', () => {
      expect(() => validateTrustRequirement({ type: 'level', value: '' })).toThrow(
        'Trust requirement value must be a non-empty string'
      );
    });

    it('should throw error for whitespace-only string value with level type', () => {
      expect(() => validateTrustRequirement({ type: 'level', value: '   ' })).toThrow(
        'Trust requirement value must be a non-empty string'
      );
    });

    it('should throw error for non-string value with level type', () => {
      expect(() => validateTrustRequirement({ type: 'level', value: 123 })).toThrow(
        'Trust requirement value must be a non-empty string'
      );
    });
  });
});
