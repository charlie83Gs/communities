/**
 * Trust Decay Utility
 *
 * Trust endorsements decay over time to ensure trust reflects ongoing relationships.
 * After 6 months, trust begins decaying linearly, reaching 0% at 12 months unless recertified.
 */

// Decay constants
export const DECAY_START_MONTHS = 6;
export const DECAY_END_MONTHS = 12;

/**
 * Calculate the decay factor for a trust endorsement based on its last updated date
 *
 * @param lastUpdated - The date the endorsement was last updated/recertified
 * @returns A number between 0 and 1 representing the trust value (1 = 100%, 0 = expired)
 */
export function calculateTrustDecay(lastUpdated: Date): number {
  const now = new Date();
  const monthsElapsed = getMonthsDifference(now, lastUpdated);

  if (monthsElapsed <= DECAY_START_MONTHS) return 1.0; // 100%
  if (monthsElapsed >= DECAY_END_MONTHS) return 0.0; // 0%

  // Linear decay from month 6 to month 12
  const decayMonths = monthsElapsed - DECAY_START_MONTHS;
  return 1.0 - decayMonths / (DECAY_END_MONTHS - DECAY_START_MONTHS);
}

/**
 * Calculate the effective trust score from a list of endorsements
 * Each endorsement is weighted by its decay factor
 *
 * @param endorsements - Array of endorsements with updatedAt dates
 * @returns The effective trust score (sum of decayed values)
 */
export function calculateEffectiveTrustScore(endorsements: Array<{ updatedAt: Date }>): number {
  return endorsements.reduce((sum, e) => {
    return sum + calculateTrustDecay(e.updatedAt);
  }, 0);
}

/**
 * Get decay information for a single endorsement
 */
export function getDecayInfo(lastUpdated: Date): {
  decayPercent: number;
  monthsUntilExpiry: number;
  isDecaying: boolean;
  isExpired: boolean;
} {
  const now = new Date();
  const monthsElapsed = getMonthsDifference(now, lastUpdated);
  const decayFactor = calculateTrustDecay(lastUpdated);

  return {
    decayPercent: Math.round((1 - decayFactor) * 100),
    monthsUntilExpiry: Math.max(0, DECAY_END_MONTHS - monthsElapsed),
    isDecaying: monthsElapsed > DECAY_START_MONTHS && monthsElapsed < DECAY_END_MONTHS,
    isExpired: monthsElapsed >= DECAY_END_MONTHS,
  };
}

/**
 * Calculate the difference in months between two dates
 */
function getMonthsDifference(date1: Date, date2: Date): number {
  const years = date1.getFullYear() - date2.getFullYear();
  const months = date1.getMonth() - date2.getMonth();
  const days = date1.getDate() - date2.getDate();

  let totalMonths = years * 12 + months;

  // Adjust for partial months
  if (days < 0) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths);
}
