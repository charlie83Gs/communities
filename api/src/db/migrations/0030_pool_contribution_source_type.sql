-- Add pool_contribution to source_type enum
ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'pool_contribution';
