ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_trust" jsonb DEFAULT '{"type":"number","value":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_wealth" jsonb DEFAULT '{"type":"number","value":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_items" jsonb DEFAULT '{"type":"number","value":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_disputes" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_polls" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_for_pool_creation" jsonb DEFAULT '{"type":"number","value":20}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_pools" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_for_council_creation" jsonb DEFAULT '{"type":"number","value":25}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_councils" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_forum" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;
