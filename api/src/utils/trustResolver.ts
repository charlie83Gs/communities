/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrustRequirement, TrustRequirementResolution } from '../types/trustLevel.types';
import { trustLevelRepository } from '../repositories/trustLevel.repository';
import { AppError } from './errors';

/**
 * Normalizes a trust requirement to the expected object format
 * Handles backward compatibility with plain numbers
 * @param requirement The raw requirement value from database
 * @returns Normalized TrustRequirement object
 */
function normalizeTrustRequirement(requirement: any): TrustRequirement | null {
  // Handle null/undefined
  if (!requirement) {
    return null;
  }

  // Backward compatibility: If it's a plain number, convert to object format
  if (typeof requirement === 'number') {
    return { type: 'number', value: requirement };
  }

  // Already in object format
  if (typeof requirement === 'object' && requirement.type && requirement.value !== undefined) {
    return requirement as TrustRequirement;
  }

  // Invalid format
  return null;
}

/**
 * Resolves a trust requirement (either numeric or level reference) to a numeric value
 * @param communityId The community ID for level reference resolution
 * @param requirement The trust requirement to resolve
 * @returns The numeric threshold value
 * @throws AppError if the trust level is not found
 */
export async function resolveTrustRequirement(
  communityId: string,
  requirement: TrustRequirement | null | undefined | any
): Promise<number> {
  // Normalize the requirement (handles backward compatibility)
  const normalized = normalizeTrustRequirement(requirement);

  // Handle null/undefined - default to 0 (no requirement)
  if (!normalized) {
    return 0;
  }

  // Handle numeric requirement
  if (normalized.type === 'number') {
    return normalized.value as number;
  }

  // Handle level reference
  if (normalized.type === 'level') {
    const levelName = normalized.value as string;
    const trustLevel = await trustLevelRepository.findByName(communityId, levelName);

    if (!trustLevel) {
      throw new AppError(`Trust level "${levelName}" not found in community`, 404);
    }

    return trustLevel.threshold;
  }

  // Invalid requirement type
  throw new AppError('Invalid trust requirement type', 400);
}

/**
 * Resolves a trust requirement and returns detailed resolution information
 * @param communityId The community ID for level reference resolution
 * @param requirement The trust requirement to resolve
 * @returns Detailed resolution information including the resolved value
 */
export async function resolveTrustRequirementDetailed(
  communityId: string,
  requirement: TrustRequirement | any
): Promise<TrustRequirementResolution> {
  // Normalize the requirement (handles backward compatibility)
  const normalized = normalizeTrustRequirement(requirement);

  if (!normalized) {
    throw new AppError('Invalid trust requirement', 400);
  }

  if (normalized.type === 'number') {
    return {
      type: 'number',
      value: normalized.value,
      resolvedValue: normalized.value as number,
    };
  }

  if (normalized.type === 'level') {
    const levelName = normalized.value as string;
    const trustLevel = await trustLevelRepository.findByName(communityId, levelName);

    if (!trustLevel) {
      throw new AppError(`Trust level "${levelName}" not found in community`, 404);
    }

    return {
      type: 'level',
      value: levelName,
      resolvedValue: trustLevel.threshold,
      levelName: trustLevel.name,
    };
  }

  throw new AppError('Invalid trust requirement type', 400);
}

/**
 * Validates that a trust requirement is properly formatted
 * @param requirement The trust requirement to validate
 * @returns true if valid, throws AppError if invalid
 */
export function validateTrustRequirement(requirement: any): requirement is TrustRequirement {
  if (!requirement || typeof requirement !== 'object') {
    throw new AppError('Trust requirement must be an object', 400);
  }

  if (!['number', 'level'].includes(requirement.type)) {
    throw new AppError('Trust requirement type must be "number" or "level"', 400);
  }

  if (requirement.type === 'number') {
    if (typeof requirement.value !== 'number' || requirement.value < 0) {
      throw new AppError('Trust requirement value must be a non-negative number', 400);
    }
  }

  if (requirement.type === 'level') {
    if (typeof requirement.value !== 'string' || requirement.value.trim().length === 0) {
      throw new AppError('Trust requirement value must be a non-empty string', 400);
    }
  }

  return true;
}
