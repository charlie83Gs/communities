export interface TrustLevel {
  id: string;
  communityId: string;
  name: string;
  threshold: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreateTrustLevelDto {
  name: string;
  threshold: number;
}

export interface UpdateTrustLevelDto {
  name?: string;
  threshold?: number;
}

// Trust requirement can be either a numeric value or a reference to a trust level
export type TrustRequirement =
  | { type: 'number'; value: number }
  | { type: 'level'; value: string };

export interface TrustRequirementResolution {
  type: 'number' | 'level';
  value: number | string;
  resolvedValue: number;
  levelName?: string;
}
