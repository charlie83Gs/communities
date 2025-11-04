import type { Item } from './items.types';

export type WealthDurationType = 'timebound' | 'unlimited';
export type WealthDistributionType = 'request_based' | 'unit_based';
export type WealthStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';

export interface Wealth {
  id: string;
  communityId: string;
  createdBy: string; // creator/owner user id
  title: string;
  description?: string;
  image?: string; // filename returned by /api/v1/images
  durationType: WealthDurationType;
  endDate?: string; // ISO date string
  distributionType: WealthDistributionType;
  unitsAvailable?: number | null;
  maxUnitsPerUser?: number | null;
  automationEnabled?: boolean;
  status: WealthStatus;
  itemId: string; // NEW: mandatory reference to Item
  item?: Item; // NEW: populated item data
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

/**
 * API DTO for creating a wealth item
 * Corresponds to POST /api/v1/wealth
 */
export interface CreateWealthDto {
  communityId: string;
  title: string;
  description?: string;
  image?: string; // optional filename to associate to wealth
  durationType: WealthDurationType;
  endDate?: string; // required if durationType === 'timebound'
  distributionType: WealthDistributionType;
  unitsAvailable?: number; // required if distributionType === 'unit_based'
  maxUnitsPerUser?: number;
  automationEnabled?: boolean;
  itemId: string; // NEW: mandatory reference to Item
}

/**
 * API DTO for updating a wealth item
 * Corresponds to PUT /api/v1/wealth/{id}
 * Note: type, durationType, and distributionType are immutable and cannot be updated
 */
export interface UpdateWealthDto {
  title?: string;
  description?: string;
  image?: string | null;
  endDate?: string | null;
  unitsAvailable?: number | null;
  maxUnitsPerUser?: number | null;
  automationEnabled?: boolean;
  status?: WealthStatus;
  itemId?: string; // NEW: optional for updates
}

/**
 * Minimal details for a wealth list item where backend might not send all fields
 * Search endpoint may include highlighted fields as Markdown.
 */
export interface WealthListItem extends Wealth {
  highlightedTitle?: string;
  highlightedDescription?: string;
}

/**
 * Wealth Request types (derived from endpoints in OpenAPI)
 */
export type WealthRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled';

export interface WealthRequest {
  id: string;
  wealthId: string;
  requesterId: string;
  requesterDisplayName?: string;
  message?: string;
  unitsRequested?: number | null;
  status: WealthRequestStatus;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
}

/**
 * DTO for creating a request on a wealth item
 * POST /api/v1/wealth/{id}/request
 */
export interface CreateWealthRequestDto {
  message?: string;
  unitsRequested?: number;
}

/**
 * Basic pagination/types if we add later
 */
export interface ListResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Search types for /api/v1/wealth/search
 */
export interface SearchWealthParams {
  q: string;
  communityId?: string;
  durationType?: WealthDurationType;
  distributionType?: WealthDistributionType;
  status?: WealthStatus;
  endDateAfter?: string;   // ISO date-time
  endDateBefore?: string;  // ISO date-time
  page?: number;           // default 1
  limit?: number;          // default 20
}

export interface SearchWealthResponse {
  items: WealthListItem[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}
// Comments for Wealth

export interface WealthComment {
  id: string;
  wealthId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

export interface CreateWealthCommentDto {
  content: string;
  parentId?: string;
}

export interface UpdateWealthCommentDto {
  content: string;
}