/**
 * Pool Types
 * Defines request/response types for the Pools feature
 */

export interface CreatePoolRequest {
  name: string;
  description: string;
  primaryItemId?: string;
  distributionType: 'manual' | 'needs_based';
  maxUnitsPerUser?: number;
  minimumContribution?: number;
}

export interface UpdatePoolRequest {
  name?: string;
  description?: string;
  primaryItemId?: string;
  distributionType?: 'manual' | 'needs_based';
  maxUnitsPerUser?: number;
  minimumContribution?: number;
}

export interface PoolInventoryItem {
  itemId: string;
  itemName: string;
  unitsAvailable: number;
}

export interface PoolResponse {
  id: string;
  communityId: string;
  councilId: string;
  councilName: string;
  name: string;
  description: string;
  primaryItem?: { id: string; name: string };
  distributionType: 'manual' | 'needs_based';
  maxUnitsPerUser?: number;
  minimumContribution?: number;
  inventory: PoolInventoryItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributeToPoolRequest {
  itemId: string;
  unitsOffered: number;
  message?: string;
  title: string;
  description?: string;
}

export interface DistributeFromPoolRequest {
  recipientId: string;
  itemId: string;
  unitsDistributed: number;
  title: string;
  description?: string;
}

export interface MassDistributeRequest {
  itemId: string;
  maxUnitsPerUser?: number;
  selectedUserIds?: string[];
  fulfillmentStrategy: 'full' | 'partial' | 'equal';
}

export interface NeedPreview {
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  unitsNeeded: number;
  priority: 'need' | 'want';
}

export interface MassDistributePreviewResponse {
  totalAvailable: number;
  totalNeeded: number;
  potentialRecipients: Array<{
    userId: string;
    userName: string;
    unitsNeeded: number;
    unitsWillReceive: number;
    priority: 'need' | 'want';
  }>;
}

export interface PendingContributionResponse {
  wealthId: string;
  contributorId: string;
  contributorName: string;
  itemId: string;
  itemName: string;
  unitsOffered: number;
  message?: string | null;
  createdAt: string;
}

export interface PoolDistributionResponse {
  wealthId: string;
  recipientId: string;
  recipientName: string;
  itemId: string;
  itemName: string;
  unitsDistributed: number;
  createdAt: string;
  isMassDistribution?: boolean;
}
