-- Migration: Add wealth request messages and notifications tables
-- Purpose: Enable private messaging threads between requesters and wealth owners,
--          and track activity notifications for users

-- Create notification type enum
CREATE TYPE "public"."notification_type" AS ENUM(
  'wealth_request_message',
  'wealth_request_status',
  'wealth_request_new',
  'pool_activity',
  'council_activity',
  'dispute_update',
  'trust_change',
  'poll_activity'
);

-- Create wealth_request_messages table
CREATE TABLE IF NOT EXISTS "wealth_request_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id" uuid NOT NULL,
  "author_id" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "community_id" uuid NOT NULL,
  "type" "notification_type" NOT NULL,
  "title" varchar(200) NOT NULL,
  "message" text,
  "resource_type" varchar(50) NOT NULL,
  "resource_id" uuid NOT NULL,
  "actor_id" text,
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "read_at" timestamp
);

-- Add foreign key constraints for wealth_request_messages
ALTER TABLE "wealth_request_messages"
  ADD CONSTRAINT "wealth_request_messages_request_id_wealth_requests_id_fk"
  FOREIGN KEY ("request_id") REFERENCES "public"."wealth_requests"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "wealth_request_messages"
  ADD CONSTRAINT "wealth_request_messages_author_id_app_users_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "public"."app_users"("id")
  ON DELETE no action ON UPDATE no action;

-- Add foreign key constraints for notifications
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_app_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_community_id_communities_id_fk"
  FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_actor_id_app_users_id_fk"
  FOREIGN KEY ("actor_id") REFERENCES "public"."app_users"("id")
  ON DELETE no action ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "idx_wealth_request_messages_request_id" ON "wealth_request_messages" ("request_id");
CREATE INDEX "idx_wealth_request_messages_author_id" ON "wealth_request_messages" ("author_id");
CREATE INDEX "idx_wealth_request_messages_created_at" ON "wealth_request_messages" ("created_at");

CREATE INDEX "idx_notifications_user_id" ON "notifications" ("user_id");
CREATE INDEX "idx_notifications_community_id" ON "notifications" ("community_id");
CREATE INDEX "idx_notifications_user_community" ON "notifications" ("user_id", "community_id");
CREATE INDEX "idx_notifications_is_read" ON "notifications" ("is_read");
CREATE INDEX "idx_notifications_created_at" ON "notifications" ("created_at");
CREATE INDEX "idx_notifications_resource" ON "notifications" ("resource_type", "resource_id");
