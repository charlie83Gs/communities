import type { Item } from './items.types';

export type DistributionType = 'manual' | 'needs_based';
export type FulfillmentStrategy = 'full' | 'partial' | 'equal';

/**
 * Pool entity
 */
export interface Pool {
  id: string;
  communityId: string;
  councilId: string;
  councilName: string;
  name: string;
  description: string;
  primaryItem?: { id: string; name: string };
  distributionType: DistributionType;
  maxUnitsPerUser?: number;
  minimumContribution?: number;
  inventory: Array<{ itemId: string; itemName: string; unitsAvailable: number }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a pool
 * POST /api/communities/:communityId/councils/:councilId/pools
 */
export interface CreatePoolRequest {
  name: string;
  description: string;
  primaryItemId?: string;
  distributionType: DistributionType;
  maxUnitsPerUser?: number;
  minimumContribution?: number;
}

/**
 * DTO for updating a pool
 * PATCH /api/communities/:communityId/pools/:poolId
 */
export interface UpdatePoolRequest {
  name?: string;
  description?: string;
  maxUnitsPerUser?: number;
  minimumContribution?: number;
}

/**
 * DTO for contributing to a pool
 * Creates a wealth share with sharingTarget='pool'
 * POST /api/communities/:communityId/pools/:poolId/contributions
 */
export interface ContributeToPoolRequest {
  itemId: string;
  unitsOffered: number;
  message?: string;
  title: string;
  description?: string;
}

/**
 * DTO for manual distribution from pool
 * Creates a wealth share with sourcePoolId
 * POST /api/communities/:communityId/pools/:poolId/distributions
 */
export interface ManualDistributeRequest {
  recipientId: string;
  itemId: string;
  unitsDistributed: number;
  title: string;
  description?: string;
}

/**
 * DTO for mass distribution from pool
 * Creates multiple wealth shares based on needs
 * POST /api/communities/:communityId/pools/:poolId/distributions/mass
 */
export interface MassDistributeRequest {
  itemId: string;
  maxUnitsPerUser?: number;
  selectedUserIds?: string[];
  fulfillmentStrategy: FulfillmentStrategy;
}

/**
 * Need preview for mass distribution planning
 */
export interface NeedPreview {
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  unitsNeeded: number;
  priority: 'need' | 'want';
}

/**
 * Pool inventory item
 */
export interface PoolInventoryItem {
  itemId: string;
  itemName: string;
  unitsAvailable: number;
  item?: Item;
}

/**
 * Pending contribution (wealth share to pool)
 */
export interface PendingContribution {
  wealthId: string;
  contributorId: string;
  contributorName: string;
  itemId: string;
  itemName: string;
  unitsOffered: number;
  message?: string;
  createdAt: string;
}

/**
 * Distribution record (wealth share from pool)
 */
export interface PoolDistribution {
  wealthId: string;
  recipientId: string;
  recipientName: string;
  itemId: string;
  itemName: string;
  unitsDistributed: number;
  createdAt: string;
  isMassDistribution?: boolean;
}

/**
 * Mass distribution preview/plan
 */
export interface MassDistributionPlan {
  itemId: string;
  itemName: string;
  totalUnitsAvailable: number;
  totalUnitsNeeded: number;
  recipients: Array<{
    userId: string;
    userName: string;
    unitsNeeded: number;
    unitsToReceive: number;
    priority: 'need' | 'want';
  }>;
  fulfillmentStrategy: FulfillmentStrategy;
  maxUnitsPerUser?: number;
}
