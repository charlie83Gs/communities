import type { Item } from './items.types';

export type NeedPriority = 'need' | 'want';
export type NeedRecurrence = 'daily' | 'weekly' | 'monthly';
export type NeedStatus = 'active' | 'fulfilled' | 'cancelled' | 'expired';

export interface Need {
  id: string;
  createdBy: string;
  communityId: string;
  itemId: string;
  title: string;
  description?: string;
  priority: NeedPriority;
  unitsNeeded: number;
  isRecurring: boolean;
  recurrence?: NeedRecurrence;
  lastFulfilledAt?: string;
  nextFulfillmentDate?: string;
  status: NeedStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  item?: Item; // Populated item data
}

export interface CouncilNeed extends Need {
  councilId: string;
}

export interface NeedAggregation {
  itemId: string;
  itemName: string;
  itemKind: 'object' | 'service';
  priority: NeedPriority;
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  totalUnitsNeeded: number;
  memberCount: number;
}

export interface CommunityNeedsAggregation {
  needs: NeedAggregation[];
  wants: NeedAggregation[];
}

export interface CreateNeedDto {
  communityId: string;
  itemId: string;
  title: string;
  description?: string;
  priority: NeedPriority;
  unitsNeeded: number;
  isRecurring: boolean;
  recurrence?: NeedRecurrence;
}

export interface UpdateNeedDto {
  title?: string;
  description?: string;
  priority?: NeedPriority;
  unitsNeeded?: number;
  isRecurring?: boolean;
  recurrence?: NeedRecurrence;
  status?: NeedStatus;
}

export interface CreateCouncilNeedDto {
  councilId: string;
  communityId: string;
  itemId: string;
  title: string;
  description?: string;
  priority: NeedPriority;
  unitsNeeded: number;
  isRecurring: boolean;
  recurrence?: NeedRecurrence;
}

export interface UpdateCouncilNeedDto {
  title?: string;
  description?: string;
  priority?: NeedPriority;
  unitsNeeded?: number;
  isRecurring?: boolean;
  recurrence?: NeedRecurrence;
  status?: NeedStatus;
}
