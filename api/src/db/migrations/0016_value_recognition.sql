-- Value Recognition System Migration
-- Creates tables for community value recognition system

-- Create category type enum
DO $$ BEGIN
 CREATE TYPE "public"."category_type" AS ENUM('care', 'community_building', 'creative', 'knowledge', 'maintenance', 'material', 'invisible_labor', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create unit type enum
DO $$ BEGIN
 CREATE TYPE "public"."unit_type" AS ENUM('hours', 'sessions', 'items', 'events', 'days', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create verification status enum
DO $$ BEGIN
 CREATE TYPE "public"."verification_status" AS ENUM('auto_verified', 'pending', 'verified', 'disputed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create source type enum
DO $$ BEGIN
 CREATE TYPE "public"."source_type" AS ENUM('system_logged', 'peer_grant', 'self_reported');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Community Value Categories Table
CREATE TABLE IF NOT EXISTS "community_value_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "community_id" uuid NOT NULL,
  "category_name" varchar(100) NOT NULL,
  "category_type" "category_type" NOT NULL,
  "unit_type" "unit_type" NOT NULL,
  "value_per_unit" numeric DEFAULT '10' NOT NULL,
  "description" text,
  "examples" text[],
  "created_at" timestamp DEFAULT now(),
  "last_reviewed_at" timestamp,
  "proposed_by" text,
  "approved_by" varchar(100),
  "is_active" boolean DEFAULT true,
  "sort_order" integer,
  "deleted_at" timestamp,
  CONSTRAINT "community_value_categories_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE cascade,
  CONSTRAINT "community_value_categories_proposed_by_app_users_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "app_users"("id")
);

CREATE INDEX IF NOT EXISTS "idx_value_categories_community" ON "community_value_categories" ("community_id");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_category_per_community" ON "community_value_categories" ("community_id", "category_name");

-- Recognized Contributions Table
CREATE TABLE IF NOT EXISTS "recognized_contributions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "community_id" uuid NOT NULL,
  "contributor_id" text NOT NULL,
  "category_id" uuid NOT NULL,
  "units" numeric NOT NULL,
  "value_per_unit" numeric NOT NULL,
  "total_value" numeric NOT NULL,
  "description" text NOT NULL,
  "verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
  "verified_by" text,
  "verified_at" timestamp,
  "beneficiary_ids" text[],
  "witness_ids" text[],
  "testimonial" text,
  "source_type" "source_type" NOT NULL,
  "source_id" uuid,
  "created_at" timestamp DEFAULT now(),
  "deleted_at" timestamp,
  CONSTRAINT "recognized_contributions_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE cascade,
  CONSTRAINT "recognized_contributions_contributor_id_app_users_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "app_users"("id") ON DELETE cascade,
  CONSTRAINT "recognized_contributions_category_id_community_value_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "community_value_categories"("id") ON DELETE cascade,
  CONSTRAINT "recognized_contributions_verified_by_app_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "app_users"("id"),
  CONSTRAINT "positive_units" CHECK ("units" > 0),
  CONSTRAINT "positive_value" CHECK ("value_per_unit" > 0)
);

CREATE INDEX IF NOT EXISTS "idx_contributions_contributor" ON "recognized_contributions" ("contributor_id");
CREATE INDEX IF NOT EXISTS "idx_contributions_community" ON "recognized_contributions" ("community_id");
CREATE INDEX IF NOT EXISTS "idx_contributions_status" ON "recognized_contributions" ("verification_status");
CREATE INDEX IF NOT EXISTS "idx_contributions_created" ON "recognized_contributions" ("created_at" DESC);

-- Contribution Summary Table
CREATE TABLE IF NOT EXISTS "contribution_summary" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "community_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "total_value_6months" numeric DEFAULT '0' NOT NULL,
  "total_value_lifetime" numeric DEFAULT '0' NOT NULL,
  "category_breakdown" text,
  "last_contribution_at" timestamp,
  "last_calculated_at" timestamp DEFAULT now(),
  CONSTRAINT "contribution_summary_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE cascade,
  CONSTRAINT "contribution_summary_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE cascade,
  CONSTRAINT "unique_summary_per_user_community" UNIQUE("community_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "idx_summary_community" ON "contribution_summary" ("community_id");
CREATE INDEX IF NOT EXISTS "idx_summary_user" ON "contribution_summary" ("user_id");

-- Peer Recognition Grants Table
CREATE TABLE IF NOT EXISTS "peer_recognition_grants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "community_id" uuid NOT NULL,
  "from_user_id" text NOT NULL,
  "to_user_id" text NOT NULL,
  "value_units" numeric NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "month_year" varchar(7),
  CONSTRAINT "peer_recognition_grants_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE cascade,
  CONSTRAINT "peer_recognition_grants_from_user_id_app_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "app_users"("id") ON DELETE cascade,
  CONSTRAINT "peer_recognition_grants_to_user_id_app_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "app_users"("id") ON DELETE cascade,
  CONSTRAINT "different_users" CHECK ("from_user_id" != "to_user_id"),
  CONSTRAINT "positive_grant" CHECK ("value_units" > 0)
);

CREATE INDEX IF NOT EXISTS "idx_peer_grants_from" ON "peer_recognition_grants" ("from_user_id", "month_year");
CREATE INDEX IF NOT EXISTS "idx_peer_grants_to" ON "peer_recognition_grants" ("to_user_id");

-- Value Calibration History Table
CREATE TABLE IF NOT EXISTS "value_calibration_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "community_id" uuid NOT NULL,
  "category_id" uuid NOT NULL,
  "old_value_per_unit" numeric NOT NULL,
  "new_value_per_unit" numeric NOT NULL,
  "reason" text,
  "proposed_by" text,
  "decided_through" varchar(50),
  "decided_at" timestamp DEFAULT now(),
  "effective_date" timestamp NOT NULL,
  CONSTRAINT "value_calibration_history_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE cascade,
  CONSTRAINT "value_calibration_history_category_id_community_value_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "community_value_categories"("id") ON DELETE cascade,
  CONSTRAINT "value_calibration_history_proposed_by_app_users_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "app_users"("id")
);

CREATE INDEX IF NOT EXISTS "idx_calibration_community" ON "value_calibration_history" ("community_id");
CREATE INDEX IF NOT EXISTS "idx_calibration_category" ON "value_calibration_history" ("category_id");

-- Add value recognition settings to communities table
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_to_view_recognition" jsonb DEFAULT '{"type":"number","value":0}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_to_log_contributions" jsonb DEFAULT '{"type":"number","value":5}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_to_grant_peer_recognition" jsonb DEFAULT '{"type":"number","value":10}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_to_verify_contributions" jsonb DEFAULT '{"type":"number","value":15}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_for_recognition_management" jsonb DEFAULT '{"type":"number","value":25}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_for_council_verification" jsonb DEFAULT '{"type":"number","value":20}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "min_trust_for_dispute_review" jsonb DEFAULT '{"type":"number","value":30}'::jsonb;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "value_recognition_settings" jsonb DEFAULT '{"enabled":true,"showAggregateStats":true,"allowPeerGrants":true,"peerGrantMonthlyLimit":20,"peerGrantSamePersonLimit":3,"requireVerification":true,"autoVerifySystemActions":true,"allowCouncilVerification":true,"verificationReminderDays":7,"softReciprocityNudges":false}'::jsonb;
