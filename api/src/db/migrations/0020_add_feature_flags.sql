-- Add feature flags to communities table
-- Core features (wealth, items, members, trust-timeline, activity, invites, trust-grants, settings) are always enabled
-- Optional features that can be toggled: pools, needs, polls, councils, forum, health analytics, disputes, contributions

ALTER TABLE "communities" ADD COLUMN "feature_flags" jsonb DEFAULT '{"poolsEnabled": true, "needsEnabled": true, "pollsEnabled": true, "councilsEnabled": true, "forumEnabled": true, "healthAnalyticsEnabled": true, "disputesEnabled": true, "contributionsEnabled": true}'::jsonb NOT NULL;
