/**
 * Pool Types
 * Defines request/response types for the Pools feature
 */

export interface CreatePoolRequest {
  name: string;
  description: string;
  maxUnitsPerUser?: number;
  minimumContribution?: number;
  allowedItemIds?: string[];
}

export interface UpdatePoolRequest {
  name?: string;
  description?: string;
  maxUnitsPerUser?: number;
  minimumContribution?: number;
  allowedItemIds?: string[];
}

export interface PoolInventoryItem {
  itemId: string;
  itemName: string;
  unitsAvailable: number;
}

export interface AllowedItemResponse {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
}

export interface PoolResponse {
  id: string;
  communityId: string;
  councilId: string;
  councilName: string;
  name: string;
  description: string;
  maxUnitsPerUser?: number;
  minimumContribution?: number;
  inventory: PoolInventoryItem[];
  allowedItems?: AllowedItemResponse[];
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

export interface PoolNeedsItemResponse {
  itemId: string;
  itemName: string;
  categoryName: string;
  totalNeedsCount: number;
  totalWantsCount: number;
  totalNeedsUnits: number;
  totalWantsUnits: number;
  poolInventoryUnits: number;
  recurrenceBreakdown: {
    oneTime: { needs: number; wants: number };
    daily: { needs: number; wants: number };
    weekly: { needs: number; wants: number };
    monthly: { needs: number; wants: number };
  };
}

export interface PoolNeedsResponse {
  items: PoolNeedsItemResponse[];
}

export interface CouncilPoolSummary {
  id: string;
  name: string;
  description: string | null;
  allowedItems: Array<{ itemId: string; itemName: string }>;
  inventorySummary: {
    totalItems: number;
    totalQuantity: number;
  };
  createdAt: string;
}

export interface CouncilPoolsResponse {
  pools: CouncilPoolSummary[];
  total: number;
}
