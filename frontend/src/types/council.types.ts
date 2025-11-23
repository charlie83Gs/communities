export interface Council {
  id: string;
  communityId: string;
  name: string;
  description: string;
  trustScore: number;
  memberCount: number;
  createdAt: string;
  createdBy: string;
}

export interface CouncilDetail extends Council {
  managers: CouncilManager[];
}

export interface CouncilManager {
  userId: string;
  userName: string;
  addedAt: string;
}

export interface CreateCouncilDto {
  name: string;
  description: string;
  additionalManagers?: string[];
}

export interface UpdateCouncilDto {
  name?: string;
  description?: string;
}

export interface CouncilsListResponse {
  councils: Council[];
  total: number;
  page: number;
  limit: number;
}

export interface CouncilTrustStatusResponse {
  userHasTrusted: boolean;
  canAwardTrust: boolean;
  trustScore: number;
}

export interface AwardCouncilTrustResponse {
  trustScore: number;
  userHasTrusted: boolean;
}

export interface RemoveCouncilTrustResponse {
  trustScore: number;
  userHasTrusted: boolean;
}

export interface AddCouncilManagerResponse {
  success: boolean;
  managers: CouncilManager[];
}

export interface RemoveCouncilManagerResponse {
  success: boolean;
}

// Council Pools types
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

// Usage Reports types
export interface UsageReportAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface ReportItemDto {
  itemId: string;
  quantity: number;
}

export interface UsageReportItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  createdAt: string;
}

export interface UsageReport {
  id: string;
  councilId: string;
  title: string;
  content: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  attachments: UsageReportAttachment[];
  items: UsageReportItem[];
}

export interface CreateUsageReportDto {
  title: string;
  content: string;
  items?: ReportItemDto[];
}

export interface UpdateUsageReportDto {
  title?: string;
  content?: string;
  items?: ReportItemDto[];
}

export interface UsageReportsListResponse {
  reports: UsageReport[];
  total: number;
  page: number;
  limit: number;
}
