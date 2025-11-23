// Skills & Endorsements Types (FT-19)

export interface UserSkill {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface UserSkillWithEndorsements {
  id: string;
  name: string;
  endorsementCount: number;
  isEndorsedByMe: boolean;
}

export interface CreateSkillDto {
  name: string;
}

export interface SkillSuggestion {
  skillId: string;
  skillName: string;
  isRelated: boolean;
  endorsementCount: number;
  isEndorsedByMe: boolean;
}

export interface EndorseSkillDto {
  communityId: string;
}

export interface GetUserSkillsParams {
  userId: string;
  communityId: string;
}

export interface GetSkillSuggestionsParams {
  userId: string;
  communityId: string;
  itemId?: string;
}

export interface RemoveEndorsementParams {
  skillId: string;
  communityId: string;
}

// API Response Types
export interface GetUserSkillsResponse {
  skills: UserSkillWithEndorsements[];
}

export interface CreateSkillResponse {
  skill: UserSkill;
}

export interface GetSkillSuggestionsResponse {
  suggestions: SkillSuggestion[];
}

export interface EndorseSkillResponse {
  success: boolean;
}
