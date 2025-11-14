-- Create dispute enums
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'in_mediation', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."dispute_participant_role" AS ENUM('initiator', 'participant');--> statement-breakpoint
CREATE TYPE "public"."dispute_mediator_status" AS ENUM('proposed', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."dispute_resolution_type" AS ENUM('open', 'closed');--> statement-breakpoint

-- Drop old dispute-related columns from communities
ALTER TABLE "communities" DROP COLUMN IF EXISTS "min_trust_for_disputes";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "min_trust_to_view_disputes";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "dispute_resolution_role";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN IF EXISTS "dispute_handling_councils";--> statement-breakpoint

-- Add new dispute configuration columns to communities
ALTER TABLE "communities" ADD COLUMN "min_trust_for_dispute_visibility" jsonb DEFAULT '{"type":"number","value":20}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_trust_for_dispute_participation" jsonb DEFAULT '{"type":"number","value":10}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "allow_open_resolutions" jsonb DEFAULT 'true'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "require_multiple_mediators" jsonb DEFAULT 'false'::jsonb;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "min_mediators_count" integer DEFAULT 1;--> statement-breakpoint

-- Create disputes table
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"status" "dispute_status" DEFAULT 'open' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);--> statement-breakpoint

-- Create dispute_participants table
CREATE TABLE "dispute_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "dispute_participant_role" NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"added_by" text NOT NULL
);--> statement-breakpoint

-- Create dispute_mediators table
CREATE TABLE "dispute_mediators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" "dispute_mediator_status" DEFAULT 'proposed' NOT NULL,
	"proposed_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"responded_by" text
);--> statement-breakpoint

-- Create dispute_resolutions table
CREATE TABLE "dispute_resolutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" uuid NOT NULL,
	"resolution_type" "dispute_resolution_type" NOT NULL,
	"resolution" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL
);--> statement-breakpoint

-- Create dispute_messages table
CREATE TABLE "dispute_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"visible_to_participants" boolean DEFAULT true NOT NULL,
	"visible_to_mediators" boolean DEFAULT true NOT NULL
);--> statement-breakpoint

-- Create dispute_history table
CREATE TABLE "dispute_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dispute_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"performed_by" text NOT NULL,
	"performed_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text
);--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_participants" ADD CONSTRAINT "dispute_participants_added_by_app_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "dispute_mediators" ADD CONSTRAINT "dispute_mediators_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_mediators" ADD CONSTRAINT "dispute_mediators_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_mediators" ADD CONSTRAINT "dispute_mediators_responded_by_app_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "dispute_resolutions" ADD CONSTRAINT "dispute_resolutions_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_resolutions" ADD CONSTRAINT "dispute_resolutions_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "dispute_history" ADD CONSTRAINT "dispute_history_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_history" ADD CONSTRAINT "dispute_history_performed_by_app_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
