import {
  poolConsumptionRepository,
  CreateConsumptionDto,
  UpdateConsumptionDto,
} from '../repositories/poolConsumption.repository';
import { councilRepository } from '../repositories/council.repository';
import { poolsRepository } from '../repositories/pools.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { appUserRepository } from '../repositories/appUser.repository';
import { AppError } from '../utils/errors';
import { openFGAService } from './openfga.service';
import logger from '../utils/logger';

export class PoolConsumptionService {
  /**
   * Check if user can manage council (community admin OR council manager)
   */
  private async canManageCouncil(
    councilId: string,
    communityId: string,
    userId: string
  ): Promise<boolean> {
    const isAdmin = await openFGAService.checkAccess(userId, 'community', communityId, 'admin');

    const canManageCouncil = await openFGAService.checkAccess(
      userId,
      'council',
      councilId,
      'can_manage'
    );

    return isAdmin || canManageCouncil;
  }

  /**
   * Create a consumption from a pool
   * Only council managers can consume from pools
   */
  async createConsumption(councilId: string, data: CreateConsumptionDto, userId: string) {
    logger.info(
      `[PoolConsumptionService createConsumption] Creating consumption for council: ${councilId}`
    );

    // Get council to verify it exists
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can consume from pools', 403);
    }

    // Verify pool exists and belongs to this council
    const pool = await poolsRepository.findById(data.poolId);
    if (!pool) {
      throw new AppError('Pool not found', 404);
    }
    if (pool.councilId !== councilId) {
      throw new AppError('Pool does not belong to this council', 400);
    }

    // Validate units
    if (data.units < 1) {
      throw new AppError('Units must be at least 1', 400);
    }

    // Validate description
    if (!data.description || data.description.length < 3) {
      throw new AppError('Description must be at least 3 characters', 400);
    }

    try {
      const consumption = await poolConsumptionRepository.create(councilId, data, userId);

      logger.info(
        `[PoolConsumptionService createConsumption] Consumption created with id: ${consumption.id}`
      );

      // Get full consumption with related data
      return await this.getConsumption(consumption.id, userId);
    } catch (err: any) {
      if (err.message === 'Insufficient inventory') {
        throw new AppError('Insufficient inventory in pool', 400);
      }
      throw err;
    }
  }

  /**
   * Get a single consumption by ID
   * Any community member can view consumptions (transparency)
   */
  async getConsumption(consumptionId: string, userId: string) {
    const consumption = await poolConsumptionRepository.findById(consumptionId);
    if (!consumption) {
      throw new AppError('Consumption not found', 404);
    }

    // Get council to check membership
    const council = await councilRepository.findById(consumption.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Get consumer details
    const consumer = consumption.consumedBy
      ? await appUserRepository.findById(consumption.consumedBy)
      : null;

    return {
      ...consumption,
      consumerName: consumer?.displayName || consumer?.email || 'Unknown',
    };
  }

  /**
   * List consumptions for a council
   * Any community member can view consumptions (transparency)
   */
  async listConsumptions(
    councilId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    // Get council to verify it exists
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const result = await poolConsumptionRepository.findByCouncil(councilId, options);

    // Add consumer details to each consumption
    const consumptionsWithDetails = await Promise.all(
      result.consumptions.map(async (consumption) => {
        const consumer = consumption.consumedBy
          ? await appUserRepository.findById(consumption.consumedBy)
          : null;
        return {
          ...consumption,
          consumerName: consumer?.displayName || consumer?.email || 'Unknown',
        };
      })
    );

    return {
      consumptions: consumptionsWithDetails,
      total: result.total,
      page: options.page || 1,
      limit: options.limit || 20,
    };
  }

  /**
   * List unreported consumptions for a council (for linking to reports)
   * Only council managers need this
   */
  async listUnreportedConsumptions(councilId: string, userId: string) {
    // Get council to verify it exists
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can view unreported consumptions', 403);
    }

    return await poolConsumptionRepository.findUnreportedByCouncil(councilId);
  }

  /**
   * Update a consumption
   * Only council managers can update consumptions
   */
  async updateConsumption(consumptionId: string, data: UpdateConsumptionDto, userId: string) {
    const consumption = await poolConsumptionRepository.findById(consumptionId);
    if (!consumption) {
      throw new AppError('Consumption not found', 404);
    }

    // Get council to get communityId
    const council = await councilRepository.findById(consumption.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(
      consumption.councilId,
      council.communityId,
      userId
    );
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can update consumptions', 403);
    }

    // Validate description if provided
    if (data.description && data.description.length < 3) {
      throw new AppError('Description must be at least 3 characters', 400);
    }

    await poolConsumptionRepository.update(consumptionId, data);

    return await this.getConsumption(consumptionId, userId);
  }

  /**
   * Link consumptions to a report
   * Only council managers can link consumptions
   */
  async linkConsumptionsToReport(
    councilId: string,
    consumptionIds: string[],
    reportId: string,
    userId: string
  ) {
    // Get council to verify it exists
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can link consumptions to reports', 403);
    }

    await poolConsumptionRepository.linkToReport(consumptionIds, reportId);

    logger.info(
      `[PoolConsumptionService linkConsumptionsToReport] Linked ${consumptionIds.length} consumptions to report ${reportId}`
    );

    return { success: true };
  }

  /**
   * Delete a consumption and restore inventory
   * Only council managers can delete consumptions
   */
  async deleteConsumption(consumptionId: string, userId: string) {
    const consumption = await poolConsumptionRepository.findById(consumptionId);
    if (!consumption) {
      throw new AppError('Consumption not found', 404);
    }

    // Get council to get communityId
    const council = await councilRepository.findById(consumption.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(
      consumption.councilId,
      council.communityId,
      userId
    );
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can delete consumptions', 403);
    }

    await poolConsumptionRepository.delete(consumptionId);

    logger.info(
      `[PoolConsumptionService deleteConsumption] Consumption ${consumptionId} deleted by ${userId}, inventory restored`
    );

    return { success: true };
  }

  /**
   * Get consumptions linked to a report
   */
  async getConsumptionsByReport(reportId: string, userId: string) {
    const consumptions = await poolConsumptionRepository.findByReport(reportId);

    // If there are consumptions, verify user has access to the council
    if (consumptions.length > 0) {
      const firstConsumption = await poolConsumptionRepository.findById(consumptions[0].id);
      if (firstConsumption) {
        const council = await councilRepository.findById(firstConsumption.councilId);
        if (council) {
          const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
          if (!userRole) {
            throw new AppError('Forbidden: not a member of this community', 403);
          }
        }
      }
    }

    return consumptions;
  }
}

export const poolConsumptionService = new PoolConsumptionService();
