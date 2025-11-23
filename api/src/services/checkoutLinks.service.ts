import { checkoutLinksRepository as defaultCheckoutLinksRepository } from '@repositories/checkoutLinks.repository';
import { poolsRepository as defaultPoolsRepository } from '@repositories/pools.repository';
import { wealthRepository as defaultWealthRepository } from '@repositories/wealth.repository';
import { itemsRepository as defaultItemsRepository } from '@repositories/items.repository';
import { communityRepository as defaultCommunityRepository } from '@repositories/community.repository';
import { councilRepository as defaultCouncilRepository } from '@repositories/council.repository';
import { AppError } from '@utils/errors';
import { openFGAService as defaultOpenFGAService } from './openfga.service';
import QRCode from 'qrcode';
import crypto from 'crypto';
import type {
  CreatePoolCheckoutLinkRequest,
  CreatePoolCheckoutLinkResponse,
  PoolCheckoutLinkListItem,
  RevokePoolCheckoutLinkRequest,
  CreateShareCheckoutLinkRequest,
  CreateShareCheckoutLinkResponse,
  ShareCheckoutLinkInfoResponse,
  PublicCheckoutDetailsResponse,
  CompleteCheckoutRequest,
  CompleteCheckoutResponse,
} from '@/types/checkoutLinks.types';

const CHECKOUT_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export class CheckoutLinksService {
  private checkoutLinksRepository: typeof defaultCheckoutLinksRepository;
  private poolsRepository: typeof defaultPoolsRepository;
  private wealthRepository: typeof defaultWealthRepository;
  private itemsRepository: typeof defaultItemsRepository;
  private communityRepository: typeof defaultCommunityRepository;
  private councilRepository: typeof defaultCouncilRepository;
  private openFGAService: typeof defaultOpenFGAService;

  constructor(
    checkoutLinksRepository = defaultCheckoutLinksRepository,
    poolsRepository = defaultPoolsRepository,
    wealthRepository = defaultWealthRepository,
    itemsRepository = defaultItemsRepository,
    communityRepository = defaultCommunityRepository,
    councilRepository = defaultCouncilRepository,
    openFGAService = defaultOpenFGAService
  ) {
    this.checkoutLinksRepository = checkoutLinksRepository;
    this.poolsRepository = poolsRepository;
    this.wealthRepository = wealthRepository;
    this.itemsRepository = itemsRepository;
    this.communityRepository = communityRepository;
    this.councilRepository = councilRepository;
    this.openFGAService = openFGAService;
  }

  // ========== Helper Methods ==========

  /**
   * Generate secure random link code (32 characters, URL-safe)
   */
  private generateLinkCode(): string {
    return crypto.randomBytes(24).toString('base64url').substring(0, 32);
  }

  /**
   * Generate QR code as base64 data URL
   */
  private async generateQRCode(checkoutUrl: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(checkoutUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 512,
        margin: 2,
      });
      return qrDataUrl;
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Build checkout URL from link code
   */
  private buildCheckoutUrl(linkCode: string): string {
    return `${CHECKOUT_BASE_URL}/checkout/${linkCode}`;
  }

  // ========== Pool Checkout Links ==========

  /**
   * Create a pool checkout link (council member or admin only)
   */
  async createPoolCheckoutLink(
    poolId: string,
    data: CreatePoolCheckoutLinkRequest,
    userId: string
  ): Promise<CreatePoolCheckoutLinkResponse> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check authorization: council member or community admin
    const isCouncilMember = await this.councilRepository.isManager(pool.councilId, userId);
    const isAdmin = await this.openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'admin'
    );

    if (!isCouncilMember && !isAdmin) {
      throw new AppError(
        'Only council members or community admins can create pool checkout links',
        403
      );
    }

    // 3. Verify item exists and belongs to community
    const item = await this.itemsRepository.findById(data.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    if (item.communityId !== pool.communityId) {
      throw new AppError('Item does not belong to the pool community', 400);
    }

    // 4. Generate unique link code
    let linkCode: string;
    let attempts = 0;
    do {
      linkCode = this.generateLinkCode();
      const existing = await this.checkoutLinksRepository.findPoolLinkByCode(linkCode);
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    if (attempts >= 5) {
      throw new AppError('Failed to generate unique link code', 500);
    }

    // 5. Build checkout URL and generate QR code
    const checkoutUrl = this.buildCheckoutUrl(linkCode);
    const qrCodeDataUrl = await this.generateQRCode(checkoutUrl);

    // 6. Create link in database
    const link = await this.checkoutLinksRepository.createPoolLink({
      poolId,
      itemId: data.itemId,
      linkCode,
      maxUnitsPerCheckout: data.maxUnitsPerCheckout ? String(data.maxUnitsPerCheckout) : null,
      isActive: true,
      createdBy: userId,
      totalCheckouts: 0,
      totalUnitsDistributed: '0',
    });

    // 7. Return response
    const itemTranslations = item.translations as { en: { name: string; unit: string } };
    return {
      id: link.id,
      linkCode: link.linkCode,
      qrCodeDataUrl,
      checkoutUrl,
      maxUnitsPerCheckout: link.maxUnitsPerCheckout ? Number(link.maxUnitsPerCheckout) : null,
      item: {
        id: item.id,
        name: itemTranslations.en.name,
        unit: itemTranslations.en.unit,
      },
      createdAt: link.createdAt.toISOString(),
    };
  }

  /**
   * List pool checkout links (council member or admin only)
   */
  async listPoolCheckoutLinks(poolId: string, userId: string): Promise<PoolCheckoutLinkListItem[]> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check authorization
    const isCouncilMember = await this.councilRepository.isManager(pool.councilId, userId);
    const isAdmin = await this.openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'admin'
    );

    if (!isCouncilMember && !isAdmin) {
      throw new AppError(
        'Only council members or community admins can view pool checkout links',
        403
      );
    }

    // 3. Get links with item details
    const links = await this.checkoutLinksRepository.listPoolLinksByPoolWithDetails(poolId);

    // 4. Map to response format (regenerate QR codes)
    return Promise.all(
      links.map(async (link) => {
        const checkoutUrl = this.buildCheckoutUrl(link.linkCode);
        const qrCodeDataUrl = await this.generateQRCode(checkoutUrl);

        return {
          id: link.id,
          item: link.item,
          linkCode: link.linkCode,
          checkoutUrl,
          qrCodeDataUrl,
          maxUnitsPerCheckout: link.maxUnitsPerCheckout ? Number(link.maxUnitsPerCheckout) : null,
          isActive: link.isActive,
          totalCheckouts: link.totalCheckouts,
          totalUnitsDistributed: Number(link.totalUnitsDistributed),
          lastCheckoutAt: link.lastCheckoutAt?.toISOString() || null,
          createdAt: link.createdAt.toISOString(),
          revokedAt: link.revokedAt?.toISOString() || null,
          revokedBy: link.revokedBy || null,
          revokeReason: link.revokeReason || null,
        };
      })
    );
  }

  /**
   * Revoke a pool checkout link
   */
  async revokePoolCheckoutLink(
    poolId: string,
    linkId: string,
    data: RevokePoolCheckoutLinkRequest,
    userId: string
  ): Promise<void> {
    // 1. Verify link exists and belongs to pool
    const link = await this.checkoutLinksRepository.findPoolLinkById(linkId);
    if (!link) {
      throw new AppError('Checkout link not found', 404);
    }
    if (link.poolId !== poolId) {
      throw new AppError('Checkout link does not belong to this pool', 400);
    }

    // 2. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 3. Check authorization
    const isCouncilMember = await this.councilRepository.isManager(pool.councilId, userId);
    const isAdmin = await this.openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'admin'
    );

    if (!isCouncilMember && !isAdmin) {
      throw new AppError(
        'Only council members or community admins can revoke pool checkout links',
        403
      );
    }

    // 4. Revoke the link
    await this.checkoutLinksRepository.revokePoolLink(linkId, userId, data.reason);
  }

  /**
   * Regenerate a pool checkout link (creates new code, revokes old)
   */
  async regeneratePoolCheckoutLink(
    poolId: string,
    linkId: string,
    userId: string
  ): Promise<CreatePoolCheckoutLinkResponse> {
    // 1. Verify link exists and belongs to pool
    const oldLink = await this.checkoutLinksRepository.findPoolLinkById(linkId);
    if (!oldLink) {
      throw new AppError('Checkout link not found', 404);
    }
    if (oldLink.poolId !== poolId) {
      throw new AppError('Checkout link does not belong to this pool', 400);
    }

    // 2. Revoke old link
    await this.revokePoolCheckoutLink(poolId, linkId, { reason: 'Regenerated' }, userId);

    // 3. Create new link with same settings
    return await this.createPoolCheckoutLink(
      poolId,
      {
        itemId: oldLink.itemId,
        maxUnitsPerCheckout: oldLink.maxUnitsPerCheckout
          ? Number(oldLink.maxUnitsPerCheckout)
          : null,
      },
      userId
    );
  }

  // ========== Share Checkout Links ==========

  /**
   * Create a share checkout link (share owner or admin only)
   */
  async createShareCheckoutLink(
    shareId: string,
    data: CreateShareCheckoutLinkRequest,
    userId: string
  ): Promise<CreateShareCheckoutLinkResponse> {
    // 1. Verify share exists
    const share = await this.wealthRepository.findById(shareId);
    if (!share) {
      throw new AppError('Share not found', 404);
    }

    // 2. Check authorization: share owner or community admin
    const isOwner = share.createdBy === userId;
    const isAdmin = await this.openFGAService.checkAccess(
      userId,
      'community',
      share.communityId,
      'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new AppError('Only the share owner or community admin can create checkout links', 403);
    }

    // 3. Check if link already exists for this share
    const existingLink = await this.checkoutLinksRepository.findShareLinkByShareId(shareId);
    if (existingLink) {
      throw new AppError('A checkout link already exists for this share', 400);
    }

    // 4. Verify share is active and has units available
    if (share.status !== 'active') {
      throw new AppError('Checkout links can only be created for active shares', 400);
    }
    if (share.unitsAvailable <= 0) {
      throw new AppError(
        'Checkout links cannot be created for shares with no units available',
        400
      );
    }

    // 5. Generate unique link code
    let linkCode: string;
    let attempts = 0;
    do {
      linkCode = this.generateLinkCode();
      const existing = await this.checkoutLinksRepository.findShareLinkByCode(linkCode);
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    if (attempts >= 5) {
      throw new AppError('Failed to generate unique link code', 500);
    }

    // 6. Build checkout URL and generate QR code
    const checkoutUrl = this.buildCheckoutUrl(linkCode);
    const qrCodeDataUrl = await this.generateQRCode(checkoutUrl);

    // 7. Create link in database
    const link = await this.checkoutLinksRepository.createShareLink({
      shareId,
      linkCode,
      maxUnitsPerCheckout: data.maxUnitsPerCheckout ? String(data.maxUnitsPerCheckout) : null,
      isActive: true,
      totalCheckouts: 0,
      totalUnitsDistributed: '0',
    });

    // 8. Return response
    return {
      id: link.id,
      linkCode: link.linkCode,
      qrCodeDataUrl,
      checkoutUrl,
      maxUnitsPerCheckout: link.maxUnitsPerCheckout ? Number(link.maxUnitsPerCheckout) : null,
      shareUnitsRemaining: share.unitsAvailable,
      createdAt: link.createdAt.toISOString(),
    };
  }

  /**
   * Get share checkout link info (share owner or admin only)
   */
  async getShareCheckoutLinkInfo(
    shareId: string,
    userId: string
  ): Promise<ShareCheckoutLinkInfoResponse> {
    // 1. Verify share exists
    const share = await this.wealthRepository.findById(shareId);
    if (!share) {
      throw new AppError('Share not found', 404);
    }

    // 2. Check authorization
    const isOwner = share.createdBy === userId;
    const isAdmin = await this.openFGAService.checkAccess(
      userId,
      'community',
      share.communityId,
      'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new AppError(
        'Only the share owner or community admin can view checkout link info',
        403
      );
    }

    // 3. Get checkout link
    const link = await this.checkoutLinksRepository.findShareLinkByShareId(shareId);
    if (!link) {
      throw new AppError('No checkout link found for this share', 404);
    }

    // 4. Generate QR code
    const checkoutUrl = this.buildCheckoutUrl(link.linkCode);
    const qrCodeDataUrl = await this.generateQRCode(checkoutUrl);

    // 5. Return response
    return {
      id: link.id,
      linkCode: link.linkCode,
      checkoutUrl,
      qrCodeDataUrl,
      maxUnitsPerCheckout: link.maxUnitsPerCheckout ? Number(link.maxUnitsPerCheckout) : null,
      isActive: link.isActive,
      totalCheckouts: link.totalCheckouts,
      totalUnitsDistributed: Number(link.totalUnitsDistributed),
      lastCheckoutAt: link.lastCheckoutAt?.toISOString() || null,
      createdAt: link.createdAt.toISOString(),
      share: {
        id: share.id,
        title: share.title,
        unitsAvailable: share.unitsAvailable,
      },
    };
  }

  /**
   * Revoke a share checkout link (manual early revoke)
   */
  async revokeShareCheckoutLink(shareId: string, userId: string): Promise<void> {
    // 1. Verify share exists
    const share = await this.wealthRepository.findById(shareId);
    if (!share) {
      throw new AppError('Share not found', 404);
    }

    // 2. Check authorization
    const isOwner = share.createdBy === userId;
    const isAdmin = await this.openFGAService.checkAccess(
      userId,
      'community',
      share.communityId,
      'admin'
    );

    if (!isOwner && !isAdmin) {
      throw new AppError('Only the share owner or community admin can revoke checkout links', 403);
    }

    // 3. Get checkout link
    const link = await this.checkoutLinksRepository.findShareLinkByShareId(shareId);
    if (!link) {
      throw new AppError('No checkout link found for this share', 404);
    }

    // 4. Deactivate the link
    await this.checkoutLinksRepository.deactivateShareLink(link.id, 'manual_revoke');
  }

  // ========== Public Checkout Endpoints ==========

  /**
   * Get checkout details (PUBLIC - no auth required)
   */
  async getCheckoutDetails(linkCode: string): Promise<PublicCheckoutDetailsResponse> {
    // 1. Try to find pool link first
    const poolLinkDetails =
      await this.checkoutLinksRepository.findPoolLinkByCodeWithDetails(linkCode);
    if (poolLinkDetails) {
      const community = await this.communityRepository.findById(poolLinkDetails.pool.communityId);
      return {
        type: 'pool',
        community: {
          id: poolLinkDetails.pool.communityId,
          name: community?.name || 'Unknown Community',
          imageUrl: null,
        },
        item: poolLinkDetails.item,
        maxUnitsPerCheckout: poolLinkDetails.maxUnitsPerCheckout
          ? Number(poolLinkDetails.maxUnitsPerCheckout)
          : null,
        availableUnits: null, // Pools don't have hard limits
        isActive: poolLinkDetails.isActive,
        message: poolLinkDetails.isActive
          ? undefined
          : poolLinkDetails.revokeReason || 'This link has been revoked',
      };
    }

    // 2. Try share link
    const shareLinkDetails =
      await this.checkoutLinksRepository.findShareLinkByCodeWithDetails(linkCode);
    if (shareLinkDetails) {
      return {
        type: 'share',
        community: {
          id: shareLinkDetails.community.id,
          name: shareLinkDetails.community.name,
          imageUrl: null,
        },
        item: shareLinkDetails.item,
        maxUnitsPerCheckout: shareLinkDetails.maxUnitsPerCheckout
          ? Number(shareLinkDetails.maxUnitsPerCheckout)
          : null,
        availableUnits: shareLinkDetails.share.unitsAvailable,
        isActive: shareLinkDetails.isActive,
        message: shareLinkDetails.isActive
          ? undefined
          : shareLinkDetails.deactivationReason === 'units_depleted'
            ? 'All gone! Thanks for sharing'
            : shareLinkDetails.deactivationReason === 'share_closed'
              ? 'This share has been completed'
              : 'This link has been deactivated',
      };
    }

    // 3. Link not found
    throw new AppError('Checkout link not found', 404);
  }

  /**
   * Complete a checkout (requires auth - user must be community member)
   */
  async completeCheckout(
    linkCode: string,
    data: CompleteCheckoutRequest,
    userId: string
  ): Promise<CompleteCheckoutResponse> {
    const { units } = data;

    // 1. Find the checkout link (pool or share)
    const poolLink = await this.checkoutLinksRepository.findPoolLinkByCodeWithDetails(linkCode);
    const shareLink = await this.checkoutLinksRepository.findShareLinkByCodeWithDetails(linkCode);

    if (!poolLink && !shareLink) {
      throw new AppError('Checkout link not found', 404);
    }

    // 2. Determine link type and extract details
    const isPoolLink = !!poolLink;
    const communityId = isPoolLink ? poolLink!.pool.communityId : shareLink!.community.id;
    const maxUnits = isPoolLink
      ? poolLink!.maxUnitsPerCheckout
        ? Number(poolLink!.maxUnitsPerCheckout)
        : null
      : shareLink!.maxUnitsPerCheckout
        ? Number(shareLink!.maxUnitsPerCheckout)
        : null;
    const isActive = isPoolLink ? poolLink!.isActive : shareLink!.isActive;

    // 3. Verify link is active
    if (!isActive) {
      throw new AppError('This checkout link has been deactivated', 400);
    }

    // 4. Verify user is a community member
    const isMember = await this.openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_community'
    );
    if (!isMember) {
      throw new AppError('You must be a member of this community to use checkout links', 403);
    }

    // 5. Check trust requirement (minTrustForCheckoutLinks)
    const community = await this.communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }
    const minTrustConfig = community.minTrustForCheckoutLinks as {
      type: string;
      value: number;
    } | null;
    const minTrust = minTrustConfig?.value ?? 5;

    const hasMinTrust = await this.openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      `can_use_checkout_links`
    );
    if (!hasMinTrust) {
      throw new AppError(`You need at least ${minTrust} trust to use checkout links`, 403);
    }

    // 6. Validate units requested
    if (units <= 0) {
      throw new AppError('Units must be a positive number', 400);
    }
    if (maxUnits && units > maxUnits) {
      throw new AppError(`Maximum ${maxUnits} units per checkout`, 400);
    }

    // 7. Handle pool vs share logic
    let wealthRequest;
    if (isPoolLink) {
      // Pool checkout - verify pool inventory
      const pool = await this.poolsRepository.findById(poolLink!.poolId);
      if (!pool || pool.deletedAt) {
        throw new AppError('Pool not found or has been deleted', 404);
      }

      // Note: In a full implementation, we would check pool inventory here
      // For now, we'll create the request and let the council handle distribution

      // Create a wealth share from the pool (this would need to be implemented in wealth service)
      // For now, we'll throw an error indicating this needs pool integration
      throw new AppError(
        'Pool checkout integration requires pool inventory management implementation',
        501
      );
    } else {
      // Share checkout - verify share has enough units
      const share = await this.wealthRepository.findById(shareLink!.shareId);
      if (!share) {
        throw new AppError('Share not found', 404);
      }
      if (share.status !== 'active') {
        throw new AppError('Share is no longer active', 400);
      }
      if (share.unitsAvailable < units) {
        throw new AppError(`Only ${share.unitsAvailable} units available`, 400);
      }

      // Create wealth request with auto-approval
      wealthRequest = await this.wealthRepository.createWealthRequest({
        wealthId: share.id,
        requesterId: userId,
        message: `Auto-approved via checkout link: ${linkCode}`,
        unitsRequested: units,
      });

      // Auto-approve the request
      await this.wealthRepository.acceptRequest(wealthRequest.id);

      // Deduct from share units
      await this.wealthRepository.decrementUnits(share.id, units);

      // Update link stats
      await this.checkoutLinksRepository.incrementShareLinkStats(shareLink!.id, units);

      // Check if share is now depleted and deactivate link if needed
      const updatedShare = await this.wealthRepository.findById(share.id);
      if (updatedShare && updatedShare.unitsAvailable <= 0) {
        await this.checkoutLinksRepository.deactivateShareLink(shareLink!.id, 'units_depleted');
      }
    }

    // 8. Return success response
    return {
      requestId: wealthRequest.id,
      unitsReceived: units,
      message: 'Checkout completed successfully',
    };
  }
}

// Export singleton instance
export const checkoutLinksService = new CheckoutLinksService();
