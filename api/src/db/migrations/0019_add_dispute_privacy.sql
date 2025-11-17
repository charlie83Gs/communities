-- Create privacy type enum
CREATE TYPE "public"."dispute_privacy_type" AS ENUM('anonymous', 'open');

-- Add privacy_type column to disputes
ALTER TABLE "disputes" ADD COLUMN "privacy_type" "dispute_privacy_type" DEFAULT 'open' NOT NULL;
