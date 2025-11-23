-- Add minTrustForCheckoutLinks column to communities table
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS min_trust_for_checkout_links JSONB DEFAULT '{"type": "number", "value": 5}';
