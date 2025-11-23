/**
 * Skills & Endorsements Types (FT-19)
 *
 * Type definitions for the skills and endorsements system.
 * Skills are user-scoped (global across communities).
 * Endorsements are community-scoped (local reputation).
 */

/**
 * User Skill (from database)
 */
export interface UserSkill {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  deletedAt?: Date | null;
}

/**
 * Skill Endorsement (from database)
 */
export interface SkillEndorsement {
  id: string;
  skillId: string;
  endorserId: string;
  communityId: string;
  createdAt: Date;
  deletedAt?: Date | null;
}

/**
 * Skill with endorsement information for a specific community
 */
export interface SkillWithEndorsements {
  id: string;
  name: string;
  endorsementCount: number;
  isEndorsedByMe: boolean;
}

/**
 * Contextual skill suggestion for endorsement flow
 * Used in wealth request endorsement modals
 */
export interface ContextualSkillSuggestion {
  skillId: string;
  skillName: string;
  isRelated: boolean; // true if from item's relatedSkills array
  endorsementCount: number;
  isEndorsedByMe: boolean;
}

/**
 * Input for creating a new skill
 */
export interface CreateSkillInput {
  name: string; // Max 50 chars, alphanumeric + space/hyphen/ampersand
}

/**
 * Input for endorsing a skill
 */
export interface EndorseSkillInput {
  skillId: string;
  communityId: string;
}

/**
 * Response for getting user skills
 */
export interface UserSkillsResponse {
  skills: SkillWithEndorsements[];
}

/**
 * Response for getting skill suggestions
 */
export interface SkillSuggestionsResponse {
  suggestions: ContextualSkillSuggestion[];
}

/**
 * Response for creating a skill
 */
export interface CreateSkillResponse {
  skill: UserSkill;
}

/**
 * Response for endorsement operations
 */
export interface EndorseSkillResponse {
  success: boolean;
}
