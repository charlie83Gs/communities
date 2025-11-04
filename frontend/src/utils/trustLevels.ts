import type { TrustLevel, TrustLevelPickerValue } from '@/types/community.types';

/**
 * Get the trust level name for a given score
 * @param score - The trust score
 * @param levels - Array of trust levels (must be sorted by threshold ascending)
 * @returns The name of the trust level, or undefined if no levels match
 */
export function getTrustLevelName(score: number, levels: TrustLevel[]): string | undefined {
  if (!levels || levels.length === 0) return undefined;

  // Find the highest level where score >= threshold
  let matchedLevel: TrustLevel | undefined;

  for (const level of levels) {
    if (score >= level.threshold) {
      matchedLevel = level;
    } else {
      break; // Since levels are sorted, no need to continue
    }
  }

  return matchedLevel?.name;
}

/**
 * Get the trust level for a given score (full object)
 * @param score - The trust score
 * @param levels - Array of trust levels (must be sorted by threshold ascending)
 * @returns The trust level object, or undefined if no levels match
 */
export function getTrustLevel(score: number, levels: TrustLevel[]): TrustLevel | undefined {
  if (!levels || levels.length === 0) return undefined;

  let matchedLevel: TrustLevel | undefined;

  for (const level of levels) {
    if (score >= level.threshold) {
      matchedLevel = level;
    } else {
      break;
    }
  }

  return matchedLevel;
}

/**
 * Format trust score with level name
 * @param score - The trust score
 * @param levels - Array of trust levels
 * @returns Formatted string like "15 (Stable)" or just "15" if no level matches
 */
export function formatTrustScore(score: number, levels: TrustLevel[]): string {
  const levelName = getTrustLevelName(score, levels);
  return levelName ? `${score} (${levelName})` : String(score);
}

/**
 * Get the numeric threshold for a trust requirement
 * @param requirement - The trust requirement (can be a level name or number)
 * @param levels - Array of trust levels
 * @returns The numeric threshold value
 */
export function resolveTrustRequirement(
  requirement: { type: 'level' | 'number'; value: string | number },
  levels: TrustLevel[]
): number | undefined {
  if (requirement.type === 'number') {
    return Number(requirement.value);
  } else if (requirement.type === 'level') {
    const level = levels.find(l => l.name === requirement.value);
    return level?.threshold;
  }
  return undefined;
}

/**
 * Format a TrustLevelPickerValue for display
 * @param value - The TrustLevelPickerValue
 * @param levels - Array of trust levels
 * @returns Formatted string like "Trusted (50)" or "Custom (25)"
 */
export function formatTrustLevelPickerValue(
  value: TrustLevelPickerValue,
  levels: TrustLevel[]
): string {
  if (value.levelId) {
    const level = levels.find(l => l.id === value.levelId);
    if (level) {
      return `${level.name} (${level.threshold})`;
    }
  }
  return `Custom (${value.customValue})`;
}
