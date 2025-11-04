CREATE TYPE "public"."invite_status" AS ENUM('pending', 'redeemed', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."item_kind" AS ENUM('object', 'service');--> statement-breakpoint
CREATE TYPE "public"."wealth_distribution_type" AS ENUM('request_based', 'unit_based');--> statement-breakpoint
CREATE TYPE "public"."wealth_duration_type" AS ENUM('timebound', 'unlimited');--> statement-breakpoint
CREATE TYPE "public"."wealth_request_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled', 'fulfilled');--> statement-breakpoint
CREATE TYPE "public"."wealth_status" AS ENUM('active', 'fulfilled', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."wealth_type" AS ENUM('object', 'service');--> statement-breakpoint
CREATE TYPE "public"."trust_posture" AS ENUM('trust', 'neutral', 'untrust');--> statement-breakpoint
CREATE TYPE "public"."trust_history_action" AS ENUM('award', 'remove', 'admin_grant');--> statement-breakpoint
CREATE TYPE "public"."poll_creator_type" AS ENUM('user', 'council', 'pool');--> statement-breakpoint
CREATE TYPE "public"."poll_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(255),
	"country" varchar(100),
	"state_province" varchar(100),
	"city" varchar(100),
	"description" text,
	"profile_image" text,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "app_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"min_trust_to_award_trust" jsonb DEFAULT '{"type":"number","value":15}'::jsonb NOT NULL,
	"trust_titles" jsonb DEFAULT '{"titles":[{"name":"New","minScore":0},{"name":"Stable","minScore":10},{"name":"Trusted","minScore":50}]}'::jsonb,
	"min_trust_for_wealth" jsonb DEFAULT '{"type":"number","value":10}'::jsonb NOT NULL,
	"min_trust_for_item_management" jsonb DEFAULT '{"type":"number","value":20}'::jsonb NOT NULL,
	"min_trust_for_disputes" jsonb DEFAULT '{"type":"number","value":20}'::jsonb,
	"dispute_resolution_role" varchar(100),
	"dispute_handling_councils" jsonb DEFAULT '[]'::jsonb,
	"poll_creator_users" jsonb DEFAULT '[]'::jsonb,
	"min_trust_for_polls" jsonb DEFAULT '{"type":"number","value":15}'::jsonb,
	"non_contribution_threshold_days" integer DEFAULT 30,
	"dashboard_refresh_interval" integer DEFAULT 3600,
	"metric_visibility_settings" jsonb DEFAULT '{"showActiveMembers":true,"showWealthGeneration":true,"showTrustNetwork":true,"showCouncilActivity":true,"showNeedsFulfillment":true,"showDisputeRate":true}'::jsonb,
	"min_trust_for_thread_creation" jsonb DEFAULT '{"type":"number","value":10}'::jsonb,
	"min_trust_for_attachments" jsonb DEFAULT '{"type":"number","value":15}'::jsonb,
	"min_trust_for_flagging" jsonb DEFAULT '{"type":"number","value":15}'::jsonb,
	"min_trust_for_flag_review" jsonb DEFAULT '{"type":"number","value":30}'::jsonb,
	"min_trust_for_forum_moderation" jsonb DEFAULT '{"type":"number","value":30}'::jsonb,
	"created_by" text,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_user_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"invited_user_id" text NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"redeemed_by" text,
	"redeemed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_link_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"title" varchar(128),
	"secret" varchar(128) NOT NULL,
	"expires_at" timestamp,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"redeemed_by" text,
	"redeemed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "resource_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"kind" "item_kind" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wealth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"community_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"duration_type" "wealth_duration_type" NOT NULL,
	"end_date" timestamp,
	"distribution_type" "wealth_distribution_type" NOT NULL,
	"units_available" integer,
	"max_units_per_user" integer,
	"automation_enabled" boolean DEFAULT false,
	"status" "wealth_status" DEFAULT 'active' NOT NULL,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wealth_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wealth_id" uuid NOT NULL,
	"requester_id" text NOT NULL,
	"message" text,
	"units_requested" integer,
	"status" "wealth_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wealth_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wealth_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_postures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"posture" "trust_posture" DEFAULT 'neutral' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"entity_type" varchar(64),
	"entity_id" uuid,
	"actor_user_id" text,
	"subject_user_id_a" text,
	"subject_user_id_b" text,
	"points_delta_a" integer DEFAULT 0 NOT NULL,
	"points_delta_b" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trust_awards_community_from_to_unique" UNIQUE("community_id","from_user_id","to_user_id")
);
--> statement-breakpoint
CREATE TABLE "admin_trust_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"admin_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"trust_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_trust_grants_community_to_user_unique" UNIQUE("community_id","to_user_id")
);
--> statement-breakpoint
CREATE TABLE "trust_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"from_user_id" text,
	"to_user_id" text NOT NULL,
	"action" "trust_history_action" NOT NULL,
	"points_delta" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"threshold" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "trust_levels_community_name_unique" UNIQUE("community_id","name"),
	CONSTRAINT "trust_levels_community_threshold_unique" UNIQUE("community_id","threshold")
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_thread_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"tag" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"best_answer_post_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"thread_id" uuid,
	"post_id" uuid,
	"vote_type" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_text" varchar(200) NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"creator_type" "poll_creator_type" NOT NULL,
	"creator_id" uuid,
	"created_by" text NOT NULL,
	"status" "poll_status" DEFAULT 'active' NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_user_invites" ADD CONSTRAINT "community_user_invites_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_user_invites" ADD CONSTRAINT "community_user_invites_invited_user_id_app_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_user_invites" ADD CONSTRAINT "community_user_invites_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_user_invites" ADD CONSTRAINT "community_user_invites_redeemed_by_app_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_link_invites" ADD CONSTRAINT "community_link_invites_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_link_invites" ADD CONSTRAINT "community_link_invites_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_link_invites" ADD CONSTRAINT "community_link_invites_redeemed_by_app_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_memberships" ADD CONSTRAINT "resource_memberships_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth" ADD CONSTRAINT "wealth_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth" ADD CONSTRAINT "wealth_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth" ADD CONSTRAINT "wealth_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth_requests" ADD CONSTRAINT "wealth_requests_wealth_id_wealth_id_fk" FOREIGN KEY ("wealth_id") REFERENCES "public"."wealth"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth_requests" ADD CONSTRAINT "wealth_requests_requester_id_app_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth_comments" ADD CONSTRAINT "wealth_comments_wealth_id_wealth_id_fk" FOREIGN KEY ("wealth_id") REFERENCES "public"."wealth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wealth_comments" ADD CONSTRAINT "wealth_comments_author_id_app_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_postures" ADD CONSTRAINT "trust_postures_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_postures" ADD CONSTRAINT "trust_postures_from_user_id_app_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_postures" ADD CONSTRAINT "trust_postures_to_user_id_app_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_actor_user_id_app_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_subject_user_id_a_app_users_id_fk" FOREIGN KEY ("subject_user_id_a") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_subject_user_id_b_app_users_id_fk" FOREIGN KEY ("subject_user_id_b") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_views" ADD CONSTRAINT "trust_views_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_views" ADD CONSTRAINT "trust_views_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_awards" ADD CONSTRAINT "trust_awards_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_awards" ADD CONSTRAINT "trust_awards_from_user_id_app_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_awards" ADD CONSTRAINT "trust_awards_to_user_id_app_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_trust_grants" ADD CONSTRAINT "admin_trust_grants_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_trust_grants" ADD CONSTRAINT "admin_trust_grants_admin_user_id_app_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_trust_grants" ADD CONSTRAINT "admin_trust_grants_to_user_id_app_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_history" ADD CONSTRAINT "trust_history_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_history" ADD CONSTRAINT "trust_history_from_user_id_app_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_history" ADD CONSTRAINT "trust_history_to_user_id_app_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_levels" ADD CONSTRAINT "trust_levels_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD CONSTRAINT "forum_categories_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_app_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_thread_tags" ADD CONSTRAINT "forum_thread_tags_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_author_id_app_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_created_by_app_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "resource_memberships_user_resource_unique" ON "resource_memberships" USING btree ("user_id","resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "trust_awards_community_to_idx" ON "trust_awards" USING btree ("community_id","to_user_id");--> statement-breakpoint
CREATE INDEX "trust_awards_community_from_idx" ON "trust_awards" USING btree ("community_id","from_user_id");--> statement-breakpoint
CREATE INDEX "trust_history_community_to_user_idx" ON "trust_history" USING btree ("community_id","to_user_id");--> statement-breakpoint
CREATE INDEX "trust_history_community_created_at_idx" ON "trust_history" USING btree ("community_id","created_at");--> statement-breakpoint
CREATE INDEX "trust_levels_community_id_idx" ON "trust_levels" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "trust_levels_threshold_idx" ON "trust_levels" USING btree ("threshold");--> statement-breakpoint
CREATE INDEX "trust_levels_community_threshold_idx" ON "trust_levels" USING btree ("community_id","threshold");