import { wealthService } from '@services/wealth.service';

/**
 * Wealth Replenishment Job
 *
 * This job runs daily to replenish recurrent wealth items (services).
 * It finds all wealth items where:
 * - isRecurrent = true
 * - status = 'active'
 * - nextReplenishmentDate <= current date
 *
 * For each eligible item, it:
 * 1. Adds recurrentReplenishValue units to unitsAvailable
 * 2. Updates lastReplenishedAt to current date
 * 3. Calculates and sets new nextReplenishmentDate based on recurrentFrequency
 *
 * @returns Summary of replenishment results
 */
export async function runWealthReplenishmentJob(): Promise<void> {
  console.log('[Wealth Replenishment Job] Starting...');

  try {
    const results = await wealthService.replenishDueWealthItems();

    console.log('[Wealth Replenishment Job] Completed:', {
      total: results.total,
      succeeded: results.succeeded,
      failed: results.failed,
    });

    if (results.errors.length > 0) {
      console.error('[Wealth Replenishment Job] Errors:', results.errors);
    }
  } catch (error) {
    console.error('[Wealth Replenishment Job] Fatal error:', error);
    throw error;
  }
}
