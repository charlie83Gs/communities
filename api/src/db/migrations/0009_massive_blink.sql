CREATE TYPE "public"."need_priority" AS ENUM('need', 'want');--> statement-breakpoint
CREATE TYPE "public"."need_recurrence" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."need_status" AS ENUM('active', 'fulfilled', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "council_needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"council_id" uuid NOT NULL,
	"created_by" text NOT NULL,
	"community_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"priority" "need_priority" DEFAULT 'need' NOT NULL,
	"units_needed" integer DEFAULT 1 NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence" "need_recurrence",
	"last_fulfilled_at" timestamp,
	"next_fulfillment_date" timestamp,
	"status" "need_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"community_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"priority" "need_priority" DEFAULT 'need' NOT NULL,
	"units_needed" integer DEFAULT 1 NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence" "need_recurrence",
	"last_fulfilled_at" timestamp,
	"next_fulfillment_date" timestamp,
	"status" "need_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "council_needs" ADD CONSTRAINT "council_needs_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "council_needs" ADD CONSTRAINT "council_needs_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "council_needs" ADD CONSTRAINT "council_needs_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "council_needs" ADD CONSTRAINT "council_needs_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
