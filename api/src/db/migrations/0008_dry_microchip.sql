CREATE TYPE "public"."recurrent_frequency" AS ENUM('weekly', 'monthly');--> statement-breakpoint
ALTER TABLE "wealth" ALTER COLUMN "distribution_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."wealth_distribution_type";--> statement-breakpoint
CREATE TYPE "public"."wealth_distribution_type" AS ENUM('unit_based');--> statement-breakpoint
ALTER TABLE "wealth" ALTER COLUMN "distribution_type" SET DATA TYPE "public"."wealth_distribution_type" USING "distribution_type"::"public"."wealth_distribution_type";--> statement-breakpoint
ALTER TABLE "wealth" ALTER COLUMN "units_available" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "wealth" ALTER COLUMN "units_available" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wealth_requests" ALTER COLUMN "units_requested" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "wealth_requests" ALTER COLUMN "units_requested" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "is_recurrent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "recurrent_frequency" "recurrent_frequency";--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "recurrent_replenish_value" integer;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "last_replenished_at" timestamp;--> statement-breakpoint
ALTER TABLE "wealth" ADD COLUMN "next_replenishment_date" timestamp;
