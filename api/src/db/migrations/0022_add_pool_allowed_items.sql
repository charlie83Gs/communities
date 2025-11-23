-- Pool Allowed Items table for pool item whitelist
CREATE TABLE IF NOT EXISTS "pool_allowed_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "pool_allowed_items" ADD CONSTRAINT "pool_allowed_items_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pool_allowed_items" ADD CONSTRAINT "pool_allowed_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;

-- Add unique constraint to prevent duplicate pool-item pairs
ALTER TABLE "pool_allowed_items" ADD CONSTRAINT "pool_allowed_items_pool_id_item_id_unique" UNIQUE ("pool_id", "item_id");
