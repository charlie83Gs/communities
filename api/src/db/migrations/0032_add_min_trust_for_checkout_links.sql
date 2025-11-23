-- Add minTrustForCheckoutLinks column to communities table
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS min_trust_for_checkout_links JSONB DEFAULT '{"type": "number", "value": 5}';

-- Update journal
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES ('0032_add_min_trust_for_checkout_links', NOW())
ON CONFLICT DO NOTHING;
