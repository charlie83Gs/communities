-- Migration: Add Skills & Endorsements System
-- FT-19: Skills & Endorsements

-- Create user_skills table (user-scoped)
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,

  -- Unique constraint: user can't add same skill twice
  CONSTRAINT user_skills_user_name_unique UNIQUE (user_id, name)
);

-- Indexes for user_skills
CREATE INDEX user_skills_user_id_idx ON user_skills(user_id);
CREATE INDEX user_skills_name_idx ON user_skills(name);

-- Create skill_endorsements table (community-scoped)
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
  endorser_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,

  -- Unique constraint: one endorsement per skill per person per community
  CONSTRAINT skill_endorsements_unique UNIQUE (skill_id, endorser_id, community_id)
);

-- Indexes for skill_endorsements
CREATE INDEX skill_endorsements_skill_community_idx ON skill_endorsements(skill_id, community_id);
CREATE INDEX skill_endorsements_community_idx ON skill_endorsements(community_id);
CREATE INDEX skill_endorsements_endorser_idx ON skill_endorsements(endorser_id);

-- Add relatedSkills to items table for contextual suggestions
ALTER TABLE items ADD COLUMN IF NOT EXISTS related_skills TEXT[];

-- Add minTrustToEndorseSkills configuration to communities table
-- Default value: 10 (same as wealth sharing threshold)
ALTER TABLE communities ADD COLUMN IF NOT EXISTS min_trust_to_endorse_skills JSONB DEFAULT '{"type": "number", "value": 10}';
