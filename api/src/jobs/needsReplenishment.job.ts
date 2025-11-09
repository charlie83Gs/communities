import { needsService } from '@services/needs.service';

/**
 * Needs Replenishment Job
 *
 * This job runs daily to update recurring needs tracking.
 * It finds all needs where:
 * - isRecurring = true
 * - status = 'active'
 * - nextFulfillmentDate <= current date
 *
 * For each eligible need, it:
 * 1. Updates lastFulfilledAt to current date
 * 2. Calculates and sets new nextFulfillmentDate based on recurrence frequency
 *
 * This ensures that recurring needs continue to be tracked over time,
 * allowing the community to see ongoing resource requirements.
 *
 * @returns Summary of replenishment results
 */
export async function runNeedsReplenishmentJob(): Promise<void> {
  console.log('[Needs Replenishment Job] Starting...');

  try {
    const results = await needsService.replenishDueNeeds();

    console.log('[Needs Replenishment Job] Completed:', {
      total: results.total,
      succeeded: results.succeeded,
      failed: results.failed,
    });

    if (results.errors.length > 0) {
      console.error('[Needs Replenishment Job] Errors:', results.errors);
    }
  } catch (error) {
    console.error('[Needs Replenishment Job] Fatal error:', error);
    throw error;
  }
}
