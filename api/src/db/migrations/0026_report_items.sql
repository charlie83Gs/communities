-- Migration: Add report_items table for tracking items used in council usage reports

CREATE TABLE IF NOT EXISTS "report_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_report_id_council_usage_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."council_usage_reports"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;
