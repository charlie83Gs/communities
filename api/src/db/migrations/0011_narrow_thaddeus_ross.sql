ALTER TABLE "communities" ADD COLUMN "min_trust_for_needs" jsonb DEFAULT '{"type":"number","value":5}'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_to_view_needs" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;
