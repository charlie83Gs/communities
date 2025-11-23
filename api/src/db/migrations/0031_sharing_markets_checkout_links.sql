-- FT-21: Sharing Markets - Checkout Links
-- Add minTrustForCheckoutLinks column to communities table
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS min_trust_for_checkout_links JSONB DEFAULT '{"type": "number", "value": 5}';

-- Add pool_checkout_link and share_checkout_link to source_type enum
ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'pool_checkout_link';
ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'share_checkout_link';

-- Pool Checkout Links (Permanent)
CREATE TABLE IF NOT EXISTS pool_checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,

  -- Link configuration
  link_code VARCHAR(32) UNIQUE NOT NULL,
  max_units_per_checkout DECIMAL(10,2),

  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by TEXT REFERENCES app_users(id),
  revoke_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by TEXT NOT NULL REFERENCES app_users(id),

  -- Stats (denormalized for performance)
  total_checkouts INTEGER DEFAULT 0 NOT NULL,
  total_units_distributed DECIMAL(10,2) DEFAULT 0 NOT NULL,
  last_checkout_at TIMESTAMPTZ
);

-- Indexes for pool checkout links
CREATE INDEX idx_pool_checkout_links_pool ON pool_checkout_links(pool_id);
CREATE INDEX idx_pool_checkout_links_code ON pool_checkout_links(link_code);
CREATE INDEX idx_pool_checkout_links_active ON pool_checkout_links(is_active) WHERE is_active = true;

-- Share Checkout Links (Temporary)
CREATE TABLE IF NOT EXISTS share_checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL UNIQUE REFERENCES wealth(id) ON DELETE CASCADE,

  -- Link configuration
  link_code VARCHAR(32) UNIQUE NOT NULL,
  max_units_per_checkout DECIMAL(10,2),

  -- Auto-managed status
  is_active BOOLEAN DEFAULT true NOT NULL,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason VARCHAR(50),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Stats
  total_checkouts INTEGER DEFAULT 0 NOT NULL,
  total_units_distributed DECIMAL(10,2) DEFAULT 0 NOT NULL,
  last_checkout_at TIMESTAMPTZ
);

-- Indexes for share checkout links
CREATE INDEX idx_share_checkout_links_share ON share_checkout_links(share_id);
CREATE INDEX idx_share_checkout_links_code ON share_checkout_links(link_code);
CREATE INDEX idx_share_checkout_links_active ON share_checkout_links(is_active) WHERE is_active = true;
