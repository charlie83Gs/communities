import { trustAwardRepository } from '../repositories/trustAward.repository';
import { trustViewRepository } from '../repositories/trustView.repository';
import { communityRepository } from '../repositories/community.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { openFGAService } from '../services/openfga.service';
import logger from '../utils/logger';

/**
 * Trust Decay Job
 *
 * This job runs daily to:
 * 1. Send notifications to grantors when their endorsements hit the 6-month decay threshold
 * 2. Recalculate effective trust scores for users with decaying endorsements
 * 3. Update OpenFGA roles when trust crosses threshold boundaries
 *
 * @returns Summary of job results
 */
export async function runTrustDecayJob(): Promise<void> {
  logger.info('[Trust Decay Job] Starting...');

  const results = {
    notificationsSent: 0,
    usersRecalculated: 0,
    rolesUpdated: 0,
    errors: [] as string[],
  };

  try {
    // Step 1: Send decay notifications
    await sendDecayNotifications(results);

    // Step 2: Recalculate trust scores and sync OpenFGA for affected users
    await recalculateDecayingTrust(results);

    logger.info('[Trust Decay Job] Completed:', results);
  } catch (error) {
    logger.error('[Trust Decay Job] Fatal error:', error);
    throw error;
  }
}

/**
 * Send notifications to grantors when their endorsements hit 6-month threshold
 */
async function sendDecayNotifications(results: {
  notificationsSent: number;
  errors: string[];
}): Promise<void> {
  try {
    const endorsements = await trustAwardRepository.getEndorsementsNeedingNotification();

    for (const endorsement of endorsements) {
      try {
        await notificationRepository.create({
          userId: endorsement.fromUserId,
          communityId: endorsement.communityId,
          type: 'trust_decay_warning',
          title: 'Trust endorsement starting to decay',
          message: `Your trust endorsement is beginning to decay. Recertify to maintain the trust level.`,
          resourceType: 'trust_award',
          resourceId: endorsement.id,
        });
        results.notificationsSent++;
      } catch (err) {
        const errorMsg = `Failed to send notification for endorsement ${endorsement.id}: ${err}`;
        logger.error(`[Trust Decay Job] ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }
  } catch (err) {
    logger.error('[Trust Decay Job] Failed to get endorsements for notifications:', err);
    results.errors.push(`Notification query failed: ${err}`);
  }
}

/**
 * Recalculate trust scores for users with decaying endorsements
 * Only update OpenFGA when thresholds are crossed
 */
async function recalculateDecayingTrust(results: {
  usersRecalculated: number;
  rolesUpdated: number;
  errors: string[];
}): Promise<void> {
  try {
    // Get all communities
    const communities = await communityRepository.findAll();

    for (const community of communities) {
      try {
        // Get users with decaying endorsements in this community
        const usersWithDecay = await trustAwardRepository.getUsersWithDecayingEndorsements(
          community.id
        );

        for (const { toUserId } of usersWithDecay) {
          try {
            // Get current score before recalculation
            const currentView = await trustViewRepository.get(community.id, toUserId);
            const oldScore = currentView?.points ?? 0;

            // Recalculate with decay
            const updated = await trustViewRepository.recalculatePoints(community.id, toUserId);
            const newScore = updated?.points ?? 0;
            results.usersRecalculated++;

            // Only sync OpenFGA if score actually changed
            if (oldScore !== newScore) {
              await syncTrustRolesIfThresholdCrossed(
                toUserId,
                community.id,
                community,
                oldScore,
                newScore,
                results
              );
            }
          } catch (err) {
            const errorMsg = `Failed to recalculate trust for user ${toUserId} in community ${community.id}: ${err}`;
            logger.error(`[Trust Decay Job] ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }
      } catch (err) {
        const errorMsg = `Failed to process community ${community.id}: ${err}`;
        logger.error(`[Trust Decay Job] ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }
  } catch (err) {
    logger.error('[Trust Decay Job] Failed to get communities:', err);
    results.errors.push(`Community query failed: ${err}`);
  }
}

/**
 * Sync OpenFGA roles only if a threshold boundary was crossed
 */
async function syncTrustRolesIfThresholdCrossed(
  userId: string,
  communityId: string,
  community: any,
  oldScore: number,
  newScore: number,
  results: { rolesUpdated: number; errors: string[] }
): Promise<void> {
  // Build thresholds map from community config
  const thresholds = [
    (community.minTrustToAwardTrust as any)?.value ?? 15,
    (community.minTrustForWealth as any)?.value ?? 10,
    (community.minTrustForPolls as any)?.value ?? 15,
    (community.minTrustForDisputeVisibility as any)?.value ?? 20,
    (community.minTrustForPoolCreation as any)?.value ?? 20,
    (community.minTrustForCouncilCreation as any)?.value ?? 25,
    (community.minTrustForForumModeration as any)?.value ?? 30,
    (community.minTrustForThreadCreation as any)?.value ?? 10,
    (community.minTrustForAttachments as any)?.value ?? 15,
    (community.minTrustForFlagging as any)?.value ?? 15,
    (community.minTrustForFlagReview as any)?.value ?? 30,
    (community.minTrustForItemManagement as any)?.value ?? 20,
    (community.minTrustForHealthAnalytics as any)?.value ?? 20,
  ];

  // Check if any threshold was crossed
  const thresholdCrossed = thresholds.some((threshold) => {
    const wasAbove = oldScore >= threshold;
    const isAbove = newScore >= threshold;
    return wasAbove !== isAbove;
  });

  if (thresholdCrossed) {
    try {
      // Full sync of trust roles
      const thresholdsMap = {
        trust_trust_viewer: (community.minTrustToViewTrust as any)?.value ?? 0,
        trust_trust_granter: (community.minTrustToAwardTrust as any)?.value ?? 15,
        trust_wealth_viewer: (community.minTrustToViewWealth as any)?.value ?? 0,
        trust_wealth_creator: (community.minTrustForWealth as any)?.value ?? 10,
        trust_needs_viewer: (community.minTrustToViewNeeds as any)?.value ?? 0,
        trust_needs_publisher: (community.minTrustForNeeds as any)?.value ?? 5,
        trust_poll_viewer: (community.minTrustToViewPolls as any)?.value ?? 0,
        trust_poll_creator: (community.minTrustForPolls as any)?.value ?? 15,
        trust_dispute_viewer: (community.minTrustForDisputeVisibility as any)?.value ?? 20,
        trust_dispute_handler: (community.minTrustForDisputeVisibility as any)?.value ?? 20,
        trust_pool_viewer: (community.minTrustToViewPools as any)?.value ?? 0,
        trust_pool_creator: (community.minTrustForPoolCreation as any)?.value ?? 20,
        trust_council_viewer: (community.minTrustToViewCouncils as any)?.value ?? 0,
        trust_council_creator: (community.minTrustForCouncilCreation as any)?.value ?? 25,
        trust_forum_viewer: (community.minTrustToViewForum as any)?.value ?? 0,
        trust_forum_manager: (community.minTrustForForumModeration as any)?.value ?? 30,
        trust_thread_creator: (community.minTrustForThreadCreation as any)?.value ?? 10,
        trust_attachment_uploader: (community.minTrustForAttachments as any)?.value ?? 15,
        trust_content_flagger: (community.minTrustForFlagging as any)?.value ?? 15,
        trust_flag_reviewer: (community.minTrustForFlagReview as any)?.value ?? 30,
        trust_item_viewer: (community.minTrustToViewItems as any)?.value ?? 0,
        trust_item_manager: (community.minTrustForItemManagement as any)?.value ?? 20,
        trust_analytics_viewer: (community.minTrustForHealthAnalytics as any)?.value ?? 20,
      };

      await openFGAService.syncTrustRoles(userId, communityId, newScore, thresholdsMap);
      results.rolesUpdated++;

      logger.info(
        `[Trust Decay Job] Updated OpenFGA roles for user ${userId} in community ${communityId}: ${oldScore} -> ${newScore}`
      );
    } catch (err) {
      const errorMsg = `Failed to sync OpenFGA for user ${userId}: ${err}`;
      logger.error(`[Trust Decay Job] ${errorMsg}`);
      results.errors.push(errorMsg);
    }
  }
}
