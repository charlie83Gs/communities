CREATE TYPE "public"."wealth_sharing_target" AS ENUM('community', 'council', 'pool');--> statement-breakpoint
CREATE TYPE "public"."pool_distribution_type" AS ENUM('manual', 'needs_based');--> statement-breakpoint
CREATE TABLE "pool_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pool_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"units_available" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"council_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"primary_item_id" uuid,
	"distribution_location" text,
	"distribution_type" "pool_distribution_type" DEFAULT 'manual' NOT NULL,
	"max_units_per_user" integer,
	"minimum_contribution" integer,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "sharing_target" "wealth_sharing_target" DEFAULT 'community' NOT NULL;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "target_council_id" uuid;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "target_pool_id" uuid;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "source_pool_id" uuid;--> statement-breakpoint
ALTER TABLE "pool_inventory" ADD CONSTRAINT "pool_inventory_pool_id_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pool_inventory" ADD CONSTRAINT "pool_inventory_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_primary_item_id_items_id_fk" FOREIGN KEY ("primary_item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pools" ADD CONSTRAINT "pools_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;
