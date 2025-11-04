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
  inventory: CouncilInventoryItem[];
  managers: CouncilManager[];
}

export interface CouncilInventoryItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  unit?: string;
}

export interface CouncilManager {
  userId: string;
  userName: string;
  addedAt: string;
}

export interface CouncilTransaction {
  id: string;
  type: 'received' | 'used' | 'transferred';
  categoryId: string;
  categoryName: string;
  quantity: number;
  description: string;
  fromUser?: string;
  toPool?: string;
  createdAt: string;
}

export interface CreateCouncilDto {
  name: string;
  description: string;
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

export interface CouncilTransactionsResponse {
  transactions: CouncilTransaction[];
  total: number;
}

export interface CouncilInventoryResponse {
  inventory: CouncilInventoryItem[];
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
