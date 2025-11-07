ALTER TABLE "communities" ADD COLUMN "min_trust_for_health_analytics" jsonb DEFAULT '{"type":"number","value":20}'::jsonb NOT NULL;
