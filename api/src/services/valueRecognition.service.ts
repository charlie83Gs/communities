import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { recognizedContributionRepository } from '../repositories/recognizedContribution.repository';
import { contributionSummaryRepository } from '../repositories/contributionSummary.repository';
import { peerRecognitionGrantRepository } from '../repositories/peerRecognitionGrant.repository';
import { valueCalibrationRepository } from '../repositories/valueCalibration.repository';
import { itemsRepository } from '../repositories/items.repository';
import { communityRepository } from '../repositories/community.repository';
import { wealthRepository } from '../repositories/wealth.repository';
import { openFGAService } from './openfga.service';

export type LogContributionDto = {
  communityId: string;
  contributorId: string;
  itemId: string;
  units: number;
  description: string;
  beneficiaryIds?: string[];
  witnessIds?: string[];
  sourceType: 'system_logged' | 'peer_grant' | 'self_reported';
  sourceId?: string;
};

export type VerifyContributionDto = {
  contributionId: string;
  userId: string;
  testimonial?: string;
};

export type DisputeContributionDto = {
  contributionId: string;
  userId: string;
  reason: string;
};

export type GrantPeerRecognitionDto = {
  communityId: string;
  fromUserId: string;
  toUserId: string;
  valueUnits: number;
  description: string;
};

export type UpdateItemValueDto = {
  itemId: string;
  newValue: number;
  reason: string;
  proposedBy: string;
  decidedThrough?: string;
};

export class ValueRecognitionService {
  /**
   * Log a contribution (self-reported or system-tracked)
   */
  async logContribution(dto: LogContributionDto) {
    // 1. Check permission to log contributions
    const canLog = await openFGAService.checkAccess(
      dto.contributorId,
      'community',
      dto.communityId,
      'can_log_contributions'
    );
    if (!canLog) {
      throw new AppError('Forbidden: you do not have permission to log contributions', 403);
    }

    // 2. Verify item exists and belongs to community
    const item = await itemsRepository.findById(dto.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    if (item.communityId !== dto.communityId) {
      throw new AppError('Item does not belong to this community', 400);
    }

    // 2. Snapshot item's current wealthValue as valuePerUnit
    const valuePerUnit = item.wealthValue;
    const totalValue = (parseFloat(valuePerUnit) * dto.units).toFixed(2);

    // 3. Set verification status based on source type
    let verificationStatus: 'auto_verified' | 'pending' | 'verified' | 'disputed' = 'pending';
    if (dto.sourceType === 'system_logged' || dto.sourceType === 'peer_grant') {
      verificationStatus = 'auto_verified';
    }

    // 4. Create contribution entry
    const contribution = await recognizedContributionRepository.create({
      communityId: dto.communityId,
      contributorId: dto.contributorId,
      itemId: dto.itemId,
      units: dto.units.toString(),
      valuePerUnit,
      totalValue,
      description: dto.description,
      verificationStatus,
      beneficiaryIds: dto.beneficiaryIds || [],
      witnessIds: dto.witnessIds || [],
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
    });

    // 5. If auto-verified, update summary immediately
    if (verificationStatus === 'auto_verified') {
      await this.updateContributionSummary(dto.contributorId, dto.communityId);
    }

    logger.info('Contribution logged', {
      contributionId: contribution.id,
      contributorId: dto.contributorId,
      communityId: dto.communityId,
      verificationStatus,
    });

    return contribution;
  }

  /**
   * Verify a contribution as beneficiary or witness
   */
  async verifyContribution(dto: VerifyContributionDto) {
    // 1. Fetch contribution
    const contribution = await recognizedContributionRepository.findById(dto.contributionId);
    if (!contribution) {
      throw new AppError('Contribution not found', 404);
    }

    // 2. Check OpenFGA permission to verify contributions
    const canVerify = await openFGAService.checkAccess(
      dto.userId,
      'community',
      contribution.communityId,
      'can_verify_contributions'
    );
    if (!canVerify) {
      throw new AppError('Forbidden: you do not have permission to verify contributions', 403);
    }

    // 3. ADDITIONAL CHECK: Must be beneficiary or witness
    const isBeneficiary = contribution.beneficiaryIds?.includes(dto.userId) || false;
    const isWitness = contribution.witnessIds?.includes(dto.userId) || false;

    if (!isBeneficiary && !isWitness) {
      throw new AppError(
        'You are not authorized to verify this contribution (not a beneficiary or witness)',
        403
      );
    }

    // 3. Update verification status
    const updated = await recognizedContributionRepository.update(dto.contributionId, {
      verificationStatus: 'verified',
      verifiedBy: dto.userId,
      verifiedAt: new Date(),
      testimonial: dto.testimonial,
    });

    // 4. Update contribution summary
    await this.updateContributionSummary(contribution.contributorId, contribution.communityId);

    logger.info('Contribution verified', {
      contributionId: dto.contributionId,
      verifiedBy: dto.userId,
    });

    return updated;
  }

  /**
   * Dispute a contribution
   */
  async disputeContribution(dto: DisputeContributionDto) {
    // 1. Fetch contribution
    const contribution = await recognizedContributionRepository.findById(dto.contributionId);
    if (!contribution) {
      throw new AppError('Contribution not found', 404);
    }

    // 2. Check OpenFGA permission to verify contributions (disputes require same permission)
    const canVerify = await openFGAService.checkAccess(
      dto.userId,
      'community',
      contribution.communityId,
      'can_verify_contributions'
    );
    if (!canVerify) {
      throw new AppError('Forbidden: you do not have permission to dispute contributions', 403);
    }

    // 3. ADDITIONAL CHECK: Must be beneficiary or witness
    const isBeneficiary = contribution.beneficiaryIds?.includes(dto.userId) || false;
    const isWitness = contribution.witnessIds?.includes(dto.userId) || false;

    if (!isBeneficiary && !isWitness) {
      throw new AppError(
        'You are not authorized to dispute this contribution (not a beneficiary or witness)',
        403
      );
    }

    // 3. Update status to disputed
    const updated = await recognizedContributionRepository.update(dto.contributionId, {
      verificationStatus: 'disputed',
      testimonial: `DISPUTE: ${dto.reason}`,
    });

    logger.warn('Contribution disputed', {
      contributionId: dto.contributionId,
      disputedBy: dto.userId,
      reason: dto.reason,
    });

    return updated;
  }

  /**
   * Grant peer recognition to another user
   */
  async grantPeerRecognition(dto: GrantPeerRecognitionDto) {
    // 1. Check permission to grant peer recognition
    const canGrant = await openFGAService.checkAccess(
      dto.fromUserId,
      'community',
      dto.communityId,
      'can_grant_peer_recognition'
    );
    if (!canGrant) {
      throw new AppError('Forbidden: you do not have permission to grant peer recognition', 403);
    }

    // 2. Verify community exists
    const community = await communityRepository.findById(dto.communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // 3. Check if granting to self
    if (dto.fromUserId === dto.toUserId) {
      throw new AppError('Cannot grant peer recognition to yourself', 400);
    }

    // 3. Get community settings
    const settings = (community.valueRecognitionSettings as any) || {};
    const monthlyLimit = settings.peer_grant_monthly_limit || 20;
    const samePersonLimit = settings.peer_grant_same_person_limit || 3;

    // 4. Check monthly limits
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthlyStats = await peerRecognitionGrantRepository.getMonthlyTotalByFromUser(
      dto.fromUserId,
      dto.communityId,
      currentMonth
    );

    const totalGranted = parseFloat(monthlyStats.totalGranted || '0');
    if (totalGranted + dto.valueUnits > monthlyLimit) {
      throw new AppError(
        `Monthly peer recognition limit exceeded. You have ${monthlyLimit - totalGranted} units remaining this month.`,
        400
      );
    }

    // 5. Check same-person limit
    const grantsToSamePerson = await peerRecognitionGrantRepository.getGrantsToSamePersonInMonth(
      dto.fromUserId,
      dto.toUserId,
      dto.communityId,
      currentMonth
    );

    if (grantsToSamePerson.length >= samePersonLimit) {
      throw new AppError(
        `You can only grant peer recognition to the same person ${samePersonLimit} times per month`,
        400
      );
    }

    // 6. Create peer recognition grant
    const grant = await peerRecognitionGrantRepository.create({
      communityId: dto.communityId,
      fromUserId: dto.fromUserId,
      toUserId: dto.toUserId,
      valueUnits: dto.valueUnits.toString(),
      description: dto.description,
      monthYear: currentMonth,
    });

    // 7. Auto-create recognized contribution (auto-verified, sourceType='peer_grant')
    // Use a generic "Peer Recognition" item or allow communities to configure this
    // For now, we'll create the contribution with totalValue equal to valueUnits
    const contribution = await recognizedContributionRepository.create({
      communityId: dto.communityId,
      contributorId: dto.toUserId,
      itemId: '00000000-0000-0000-0000-000000000000', // Placeholder - communities should configure peer recognition item
      units: '1',
      valuePerUnit: dto.valueUnits.toString(),
      totalValue: dto.valueUnits.toString(),
      description: `Peer recognition from user: ${dto.description}`,
      verificationStatus: 'auto_verified',
      sourceType: 'peer_grant',
      sourceId: grant.id,
    });

    // 8. Update contribution summary
    await this.updateContributionSummary(dto.toUserId, dto.communityId);

    logger.info('Peer recognition granted', {
      grantId: grant.id,
      fromUserId: dto.fromUserId,
      toUserId: dto.toUserId,
      valueUnits: dto.valueUnits,
    });

    return { grant, contribution };
  }

  /**
   * Check peer recognition limits for a user
   */
  async checkPeerRecognitionLimits(userId: string, communityId: string) {
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    const settings = (community.valueRecognitionSettings as any) || {};
    const monthlyLimit = settings.peer_grant_monthly_limit || 20;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyStats = await peerRecognitionGrantRepository.getMonthlyTotalByFromUser(
      userId,
      communityId,
      currentMonth
    );

    const totalGranted = parseFloat(monthlyStats.totalGranted || '0');
    const remaining = Math.max(0, monthlyLimit - totalGranted);

    return {
      monthlyLimit,
      used: totalGranted,
      remaining,
      currentMonth,
    };
  }

  /**
   * Get contribution profile for a user
   */
  async getContributionProfile(userId: string, communityId: string, requestingUserId: string) {
    // 1. Check permission: can view contributions OR viewing own profile
    const isViewingOwnProfile = userId === requestingUserId;

    if (!isViewingOwnProfile) {
      const canView = await openFGAService.checkAccess(
        requestingUserId,
        'community',
        communityId,
        'can_view_contributions'
      );
      if (!canView) {
        throw new AppError(
          'Forbidden: you do not have permission to view contribution profiles',
          403
        );
      }
    }

    // 2. Try to get cached summary
    let summary = await contributionSummaryRepository.findByUserAndCommunity(userId, communityId);

    // 2. If no summary exists or it's stale, recalculate
    if (!summary || this.isSummaryStale(summary.lastCalculatedAt)) {
      await this.updateContributionSummary(userId, communityId);
      summary = await contributionSummaryRepository.findByUserAndCommunity(userId, communityId);
    }

    // 3. Get recent contributions with item details
    const recentContributions = await recognizedContributionRepository.findByContributor(
      userId,
      communityId,
      20
    );

    // 4. Parse item breakdown from summary
    const itemBreakdown = summary?.categoryBreakdown ? JSON.parse(summary.categoryBreakdown) : {};

    return {
      summary: {
        totalValue6Months: summary?.totalValue6Months || '0',
        totalValueLifetime: summary?.totalValueLifetime || '0',
        itemBreakdown,
        lastContributionAt: summary?.lastContributionAt,
        lastCalculatedAt: summary?.lastCalculatedAt,
      },
      recentContributions: recentContributions.map((rc) => ({
        id: rc.contribution.id,
        itemName: (rc.item?.translations as any)?.en?.name || 'Unknown',
        units: rc.contribution.units,
        totalValue: rc.contribution.totalValue,
        description: rc.contribution.description,
        verificationStatus: rc.contribution.verificationStatus,
        testimonial: rc.contribution.testimonial,
        createdAt: rc.contribution.createdAt,
      })),
    };
  }

  /**
   * Update contribution summary for a user (recalculate aggregates)
   */
  async updateContributionSummary(userId: string, communityId: string) {
    // 1. Calculate 6-month cutoff date
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 2. Get verified contributions in last 6 months
    const recent = await recognizedContributionRepository.findVerifiedSince(
      userId,
      communityId,
      sixMonthsAgo
    );

    // 3. Get all-time verified contributions
    const lifetime = await recognizedContributionRepository.findVerifiedSince(
      userId,
      communityId,
      new Date('1970-01-01')
    );

    // 4. Calculate totals
    const totalValue6Months = recent
      .reduce((sum, c) => sum + parseFloat(c.totalValue), 0)
      .toFixed(2);
    const totalValueLifetime = lifetime
      .reduce((sum, c) => sum + parseFloat(c.totalValue), 0)
      .toFixed(2);

    // 5. Get item breakdown (for recent contributions)
    const itemBreakdown = await recognizedContributionRepository.getItemBreakdownByUser(
      userId,
      communityId,
      sixMonthsAgo
    );

    // 6. Build category breakdown JSON
    const categoryBreakdown: Record<string, number> = {};
    for (const item of itemBreakdown) {
      const itemName = (item.itemTranslations as any)?.en?.name || 'Unknown';
      categoryBreakdown[itemName] = parseFloat(item.totalValue);
    }

    // 7. Find most recent contribution date
    const lastContribution = recent.length > 0 ? recent[0].createdAt : null;

    // 8. Upsert summary
    await contributionSummaryRepository.upsert(userId, communityId, {
      totalValue6Months,
      totalValueLifetime,
      categoryBreakdown: JSON.stringify(categoryBreakdown),
      lastContributionAt: lastContribution || undefined,
      lastCalculatedAt: new Date(),
    });

    logger.info('Contribution summary updated', { userId, communityId });
  }

  /**
   * Auto-log contribution from wealth fulfillment
   */
  async autoLogFromWealthFulfillment(wealthId: string) {
    // 1. Fetch wealth entry
    const wealth = await wealthRepository.findById(wealthId);
    if (!wealth) {
      throw new AppError('Wealth entry not found', 404);
    }

    // 2. Skip if already logged
    const existing = await recognizedContributionRepository.findByItemAndDateRange(
      wealth.itemId,
      new Date(wealth.createdAt.getTime() - 1000),
      new Date(wealth.createdAt.getTime() + 1000)
    );
    if (existing.length > 0) {
      return null; // Already logged
    }

    // 3. Fetch linked item
    const item = await itemsRepository.findById(wealth.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // 4. Create auto-verified contribution
    const contribution = await this.logContribution({
      communityId: wealth.communityId,
      contributorId: wealth.createdBy,
      itemId: wealth.itemId,
      units: wealth.unitsAvailable || 1,
      description: `Wealth sharing: ${wealth.title}`,
      sourceType: 'system_logged',
      sourceId: wealthId,
    });

    logger.info('Auto-logged contribution from wealth fulfillment', {
      wealthId,
      contributionId: contribution.id,
    });

    return contribution;
  }

  /**
   * Update item value (calibration)
   */
  async updateItemValue(dto: UpdateItemValueDto) {
    // 1. Verify item exists
    const item = await itemsRepository.findById(dto.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // 2. Check permission to manage recognition system
    const canManage = await openFGAService.checkAccess(
      dto.proposedBy,
      'community',
      item.communityId,
      'can_manage_recognition'
    );
    if (!canManage) {
      throw new AppError(
        'Forbidden: you do not have permission to manage recognition or calibrate values',
        403
      );
    }

    const oldValue = parseFloat(item.wealthValue);

    // 2. Create calibration history entry
    await valueCalibrationRepository.create({
      communityId: item.communityId,
      itemId: dto.itemId, // Note: valueCalibrationRepository may use categoryId field - check schema
      oldValuePerUnit: oldValue.toString(),
      newValuePerUnit: dto.newValue.toString(),
      reason: dto.reason,
      proposedBy: dto.proposedBy,
      decidedThrough: dto.decidedThrough || 'admin',
      effectiveDate: new Date(),
    });

    // 3. Update item's wealthValue
    await itemsRepository.update(dto.itemId, {
      wealthValue: dto.newValue.toString(),
    });

    logger.info('Item value calibrated', {
      itemId: dto.itemId,
      oldValue,
      newValue: dto.newValue,
      proposedBy: dto.proposedBy,
    });

    return { oldValue, newValue: dto.newValue };
  }

  /**
   * Detect suspicious patterns for anti-gaming
   */
  async detectSuspiciousPatterns(userId: string, communityId: string) {
    const flags: string[] = [];

    // 1. High volume self-reports without verification
    const recentContributions = await recognizedContributionRepository.findByContributor(
      userId,
      communityId,
      100
    );
    const selfReported = recentContributions.filter(
      (rc) => rc.contribution.sourceType === 'self_reported'
    );
    const pendingVerification = selfReported.filter(
      (rc) => rc.contribution.verificationStatus === 'pending'
    );

    if (pendingVerification.length > 10) {
      flags.push(
        `High volume of pending verifications (${pendingVerification.length} unverified contributions)`
      );
    }

    // 2. Multiple disputes
    const disputed = recentContributions.filter(
      (rc) => rc.contribution.verificationStatus === 'disputed'
    );
    if (disputed.length > 2) {
      flags.push(`Multiple disputed contributions (${disputed.length} disputes)`);
    }

    // 3. Peer grants concentrated in small group (check received grants)
    const currentMonth = new Date().toISOString().substring(0, 7);
    const receivedGrants = await peerRecognitionGrantRepository.findByToUser(
      userId,
      communityId,
      50
    );
    const recentGrants = receivedGrants.filter((g) => g.grant.monthYear === currentMonth);

    // Check if grants come from same few users
    const grantorCounts: Record<string, number> = {};
    for (const rg of recentGrants) {
      grantorCounts[rg.grant.fromUserId] = (grantorCounts[rg.grant.fromUserId] || 0) + 1;
    }

    const dominantGrantors = Object.entries(grantorCounts).filter(([_, count]) => count > 5);
    if (dominantGrantors.length > 0) {
      flags.push(
        `Peer grants concentrated from few users (${dominantGrantors.length} users with 5+ grants)`
      );
    }

    return { flags, suspicious: flags.length > 0 };
  }

  /**
   * Helper to check if summary is stale (older than 1 hour)
   */
  private isSummaryStale(lastCalculatedAt: Date | null): boolean {
    if (!lastCalculatedAt) return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastCalculatedAt < oneHourAgo;
  }
}

export const valueRecognitionService = new ValueRecognitionService();
